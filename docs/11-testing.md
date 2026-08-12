# 11 · Testing

## Casos de prueba

Derivados directo de los criterios de aceptación (Gherkin) de `04-historias-de-usuario`. El campo **Estado** refleja el resultado de la prueba end-to-end real ya realizada sobre el número de WhatsApp en producción.

| ID | HU | Escenario | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|---|
| TC-01 | HU-01 | Primer mensaje de un cliente nuevo | Enviar cualquier texto a un número sin conversación previa | El bot responde con bienvenida + botones de tipo de seguro | ✅ Pasado |
| TC-02 | HU-02 | Selección de Auto/Moto | Tocar el botón "Auto / Moto" | El bot avanza y pide la patente | ✅ Pasado |
| TC-03 | HU-02 | Selección de tipo no disponible | Tocar el botón "Otro (Hogar, Comercio...)" | El bot informa que se gestiona manualmente y no sigue el flujo automatizado | ✅ Pasado |
| TC-04 | HU-03 | Patente con formato inválido | Responder con un valor que no matchea el regex (ej. `12345`) | El bot pide el dato de nuevo, indicando el formato esperado | ✅ Pasado |
| TC-05 | HU-03 | Patente válida | Responder con formato correcto de auto (`AB123CD`) o moto (`A123BCD`) | El bot avanza y pide la marca | ✅ Pasado (auto) / ✅ Pasado (moto, tras BUG-11) |
| TC-06 | HU-03 | Código postal no numérico | Responder con letras en vez de números | El bot vuelve a pedir el código postal | ✅ Pasado |
| TC-07 | HU-04 | Cliente elige "No sé, recomendame" | Tocar esa opción en la lista | El bot muestra el resumen de pros/contras y vuelve a preguntar | ✅ Pasado |
| TC-08 | HU-04 | Cliente elige una aseguradora directamente | Tocar "Rivadavia" (o cualquiera de la lista) | El bot guarda esa preferencia y cierra el flujo | ✅ Pasado |
| TC-09 | HU-05 | Guardado del lead en Sheets | Completar el flujo entero | Se agrega una fila nueva en la hoja "Leads" con los datos correctos y `Estado = Pendiente` | ✅ Pasado (tras resolver BUG-02 y BUG-03) |
| TC-10 | HU-05 | Notificación a Sandra | Completar el flujo entero | Sandra recibe el WhatsApp con nombre, tipo de seguro y aseguradora | ✅ Pasado — plantilla aprobada por Meta, notificación confirmada recibida por Sandra en producción |
| TC-11 | HU-06 | Conversación abandonada | Iniciar el flujo y no responder por más de 24hs | El job marca la sesión como `abandonada` en Redis | ⏸️ No validado — bloqueado por BUG-10, deprioritizado a propósito (bajo volumen de tráfico actual no justifica el costo de resolverlo todavía) |
| TC-12 | HU-07 | Pedido de cotización en otra aseguradora | Luego de recibir la primera cotización, pedir otra | El broker cotiza en la nueva aseguradora reutilizando los datos ya capturados | ✅ Pasado (depende de proceso manual del broker, fuera del bot) |

## Registro de bugs encontrados

Bugs reales detectados durante las pruebas end-to-end sobre el número de producción, con su causa y resolución.

### BUG-01 · WABA duplicado bloqueaba el registro del número

- **Síntoma:** Error genérico al intentar registrar el número en la Cloud API
- **Causa:** El número tenía un WhatsApp Business Account (WABA) duplicado — quedó asociado a dos cuentas de WhatsApp Business a la vez
- **Resolución:** Se dio de baja el WABA duplicado; una vez propagada la baja, se pudo completar el registro
- **Aprendizaje:** Antes de conectar un número existente a la Cloud API, conviene verificar que no tenga cuentas duplicadas o conflictivas en Meta Business Suite

### BUG-02 · Falla al guardar en Google Sheets — private key mal formateada

- **Síntoma:** Errores en los logs de Render al intentar autenticar contra la Google Sheets API
- **Causa:** La variable de entorno `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` tenía comillas de más al configurarla en Render, rompiendo el formato de la clave
- **Resolución:** Se corrigió el valor de la variable de entorno, sin comillas adicionales
- **Aprendizaje:** Al pegar una private key (multilínea, con `\n`) en un panel de variables de entorno, revisar que la plataforma de hosting no agregue comillas propias por fuera de las que ya trae el JSON original

### BUG-03 · Nombre de la pestaña de la planilla no coincidía

- **Síntoma:** Falla al escribir en la planilla, aun con las credenciales ya corregidas
- **Causa:** `googleSheets.js` tiene hardcodeado el rango `Leads!A:I` (ver `10-implementacion`), pero la pestaña real de la planilla tenía otro nombre
- **Resolución:** Se renombró la pestaña a `Leads`, para que coincida exactamente con el código
- **Aprendizaje:** Documentar (acá mismo) que el nombre de la pestaña es un valor fijo en el código, no configurable por variable de entorno — si se quiere cambiar, hay que tocar `RANGO_HOJA` en `googleSheets.js`

### BUG-04 · Notificación a Sandra no llegaba

- **Síntoma:** El lead se guardaba bien en Sheets, pero la notificación a Sandra fallaba silenciosamente (comportamiento esperado por RF-19, pero no debía estar fallando)
- **Causa:** La plantilla aprobada (`nuevo_lead_cotizacion`) había quedado registrada en el WABA duplicado/incorrecto (ver BUG-01), no en la cuenta real que terminó usando el número
- **Resolución:** Se recreó la plantilla en la WABA correcta. Meta la aprobó y la notificación fue confirmada recibida por Sandra en producción
- **Aprendizaje:** El orden de resolución de BUG-01 importaba: hasta no tener claro cuál era el WABA "correcto", cualquier plantilla creada corría riesgo de quedar en el lugar equivocado

### BUG-05 · Mensajes duplicados por cold start de Render

- **Síntoma:** El bot respondió el mismo "no entendí esa opción" varias veces seguidas ante un único mensaje del cliente (detectado por una usuaria real probando el bot)
- **Causa:** El plan gratuito de Render pone el servidor a dormir tras inactividad; al despertar (~1 minuto), Meta ya había reintentado enviar el mismo evento de webhook varias veces por no recibir respuesta a tiempo, y cada reintento se procesaba como un mensaje nuevo, haciendo avanzar la conversación varias veces con el mismo texto
- **Resolución:** Se agregó deduplicación por `message.id` en Redis (`marcarMensajeComoNuevo` en `redisClient.js`) — cualquier reintento con un ID ya visto se ignora
- **Aprendizaje:** Con webhooks de Meta, la deduplicación por ID no es opcional — hay que asumir que cualquier evento puede llegar más de una vez, más allá de la causa puntual (acá, cold start; podría ser cualquier otra demora de red)

### BUG-06 · Texto libre no reconocido se guardaba con la aseguradora por defecto

- **Síntoma:** Una usuaria real escribió "Rivadadia" (typo) en vez de tocar el botón de la lista, y el lead quedó guardado con `Triunfo` — una aseguradora distinta a la que pidió
- **Causa:** `manejarAseguradora` en `flujoCotizacion.js` caía directo al default (`config.aseguradoraPorDefecto`) ante cualquier texto que no matcheara *exactamente* el ID de un botón, sin diferenciar "no contestó nada" de "contestó algo que no se procesó bien"
- **Resolución:** Se agregó reconocimiento de texto libre con tolerancia a typos (distancia de Levenshtein, hasta 2 caracteres de diferencia) — si no hay ninguna coincidencia razonable, el bot vuelve a mostrar la lista de opciones en vez de asumir una aseguradora
- **Aprendizaje:** Es un bug de bajo impacto técnico pero alto impacto de negocio — un default silencioso mal aplicado puede hacer que se cotice en la aseguradora equivocada sin que nadie lo note hasta después. Vale la pena revisar con esta lupa cualquier otro punto del flujo donde haya un valor por default

### Nota pendiente: RF-11 tal como está redactado no está completamente implementado

RF-11 dice que el default a Triunfo debería aplicarse "luego de un tiempo definido sin respuesta" — es decir, un timeout real. Lo que había en el código (y que BUG-06 corrigió) no era eso: era un default inmediato ante cualquier respuesta no reconocida, sin esperar nada. Con la corrección de BUG-06, ese default inmediato ya no ocurre — pero el timeout real tampoco está implementado todavía. Por ahora, si el cliente no responde nada, la sesión simplemente sigue esperando hasta que HU-06/RF-15 la marque como abandonada a las 24hs (sin asignar ninguna aseguradora). Si más adelante se quiere el comportamiento exacto de RF-11 (asignar Triunfo automáticamente tras el timeout, en vez de solo abandonar), habría que sumar esa lógica al job de `marcarAbandonadas.js`.

### BUG-07 · Función anidada mal ubicada rompía la derivación manual

- **Síntoma:** Al agregar la captura de nombre para la derivación manual (Hogar/Comercio/General), `manejarNombreManual` quedó declarada **dentro** de `manejarAseguradora` en vez de como función separada; de paso, el fix de BUG-06 se perdió en el mismo cambio, volviendo a la versión que asignaba Triunfo en silencio
- **Causa:** Un pegado de código a mitad de función en vez de agregarlo como función nueva al final del archivo
- **Resolución:** Se reordenó `manejarNombreManual` como función de nivel superior (hermana de las demás), y se reincorporó el reconocimiento de texto libre con tolerancia a typos en `manejarAseguradora`. Se verificó con `node --check` que el archivo compila sin errores de sintaxis
- **Aprendizaje:** En JavaScript, una función declarada dentro de otra función solo existe ahí adentro — si otro lugar del código la necesita (acá, el `switch` de `procesarPaso`), tiene que estar en el mismo nivel. Vale la pena correr `node --check archivo.js` después de cualquier pegado de código a mano, antes de deployar

### BUG-08 · El fix de deduplicación nunca llegó a webhookGateway.js

- **Síntoma:** Después de "corregir" BUG-05, los mensajes duplicados no solo siguieron — empeoraron (de 5 a 15 mensajes en una sola prueba), con un tiempo de cold start aún más largo (4 minutos)
- **Causa:** El `import` de `marcarMensajeComoNuevo` y el chequeo de deduplicación nunca se agregaron realmente a `webhookGateway.js` en el repositorio — quedó con la versión vieja, sin el fix, a pesar de que `redisClient.js` sí lo tenía
- **Resolución:** Se re-agregó el import y el chequeo a `webhookGateway.js`, respetando las rutas de import relativas ya existentes en el archivo real (sin la `../` que tenía la versión de referencia del chat, que no coincidía con la estructura real del repo)
- **Aprendizaje:** Cuando un fix toca varios archivos que dependen entre sí, hay que confirmar que **todos** llegaron al repositorio, no solo el que se está mirando en el momento — un fix a medio aplicar puede ser peor que no aplicarlo, porque da falsa confianza de que "ya está resuelto". Vale la pena, después de cualquier fix multi-archivo, grepear el proyecto por el nombre de la función nueva (acá, `marcarMensajeComoNuevo`) y confirmar que aparece tanto en su definición como en cada lugar donde se la llama

### BUG-09 · whatsapp.js sin el `id` real — el fix de deduplicación bloqueaba TODO después del primer mensaje

- **Síntoma:** Tras aplicar BUG-08, el bot respondió el primer mensaje pero se quedó mudo ante el segundo ("Otro seguro"). En los logs de Render apareció `Mensaje duplicado ignorado: undefined`
- **Causa:** `whatsapp.js` (el tercer archivo del trío del fix de BUG-05) nunca se actualizó con la extracción del `id` real del mensaje. Con `id` siempre `undefined`, la clave de deduplicación en Redis (`msg:undefined`) era la misma para *todos* los mensajes — el primero la creaba, y cada mensaje siguiente chocaba contra ella y se descartaba como si fuera un duplicado, aunque fuera contenido nuevo
- **Resolución:** Se agregó `const id = mensaje.id;` en `extraerMensajeEntrante` (`whatsapp.js`), incluyéndolo en los tres `return` posibles (texto, selección de botón/lista, no soportado)
- **Aprendizaje:** Este bug es hermano directo de BUG-08 — mismo fix de tres archivos (`whatsapp.js`, `redisClient.js`, `webhookGateway.js`), pero esta vez faltó un tercer archivo distinto en vez de uno solo. Confirma el aprendizaje de BUG-08: grepear el proyecto entero por cada pieza nueva del fix (acá, tanto `marcarMensajeComoNuevo` como el campo `id`) antes de dar por cerrado un cambio multi-archivo. Un dato interesante: el bug fue **peor que no tener el fix** — pasar de "duplica mensajes" a "silencia mensajes" es un paso atrás, no uno neutro

### Mejora detectada durante testing: nombre del cliente aparecía como "(no informado)"

- **Síntoma:** La notificación a Sandra llegó correctamente pero mostraba `(no informado)` en el campo de nombre, porque el flujo de Auto/Moto nunca pedía el nombre explícitamente
- **Causa:** El flujo de captación de Auto/Moto solo pedía patente, marca, código postal y aseguradora — no incluía un paso para el nombre
- **Resolución:** En vez de agregar una pregunta extra al flujo (más fricción para el cliente), se implementó la captura automática del nombre del perfil de WhatsApp, que Meta ya incluye en el payload del webhook (`contacts[0].profile.name`). Se extrae en `whatsapp.js` y se guarda en la sesión desde `conversationService.js`, sin que el cliente tenga que hacer nada
- **Aprendizaje:** Antes de agregar un campo nuevo al flujo de conversación, revisar si el dato ya está disponible en el payload de Meta — evita sumar fricción innecesaria al cliente

### BUG-10 · El job de abandono no corre si el servidor está dormido

- **Síntoma:** Una sesión superó ampliamente las 24hs de inactividad (transcurrieron ~3hs desde el umbral) y seguía figurando `estado_conversacion: "activa"` en Redis
- **Causa:** `node-cron` depende de que el proceso de Node esté corriendo en el momento exacto de cada disparo programado. En el plan gratuito de Render, sin tráfico HTTP entrante el proceso se duerme a los ~15 minutos de inactividad — mientras está dormido, ningún timer interno (incluido el cron) puede dispararse
- **Resolución:** Decisión consciente de no resolver por ahora — con el volumen de tráfico actual (bajo), no se justifica pagar un plan de Render ni sumar un servicio externo de keep-alive. Queda como limitación conocida, a revisar si el volumen de conversaciones crece (ver KPI-01 en `12-kpis-y-resultados`)
- **Aprendizaje:** Un cron interno (`node-cron`) solo es confiable si el proceso que lo hostea está garantizado de estar siempre vivo. En hosting con sleep automático, cualquier tarea programada (no solo esta) corre el riesgo de no dispararse — vale la pena tenerlo en cuenta para futuras funcionalidades basadas en tiempo

### BUG-11 · El regex de patente no contemplaba el formato de moto

- **Síntoma:** Un cliente real no pudo cargar la patente de su moto (`A123BCD`) — el bot la rechazaba una y otra vez
- **Causa:** `REGEX_PATENTE` solo contemplaba los dos formatos de patente de **auto** (viejo `ABC123`, mercosur `AB123CD`), pero nunca se agregó el formato mercosur de **moto** (1 letra + 3 números + 3 letras, ej. `A123BCD`) — a pesar de que el tipo de seguro literalmente se llama "Auto/Moto" (HU-02)
- **Resolución:** Se agregó la tercera variante al regex: `^[A-Z]\d{3}[A-Z]{3}$`. Verificado con los 3 formatos válidos y los inválidos ya probados en TC-04
- **Aprendizaje:** Cuando un campo de un flujo dice cubrir dos categorías ("Auto/Moto"), hay que validar explícitamente con datos reales de *cada* categoría, no solo de la más común. Un test que solo prueba con patentes de auto puede pasar en verde y dejar la mitad del flujo roto

## Estado general

**10 de 12 casos de prueba pasados, 1 deprioritizado a propósito (TC-11), 1 dependiente de proceso manual externo (TC-12).** El proyecto se da por cerrado en esta iteración con este resultado — no queda ningún pendiente de lógica de negocio, solo una limitación de infraestructura aceptada conscientemente por bajo volumen de uso actual.

Todos los bugs de lógica y de código (BUG-01 a BUG-09) están resueltos. El flujo end-to-end completo — desde el primer mensaje del cliente, pasando por la captación guiada de datos con validación, la elección de aseguradora (con y sin texto libre), el guardado en Google Sheets, y la notificación a Sandra por WhatsApp — está funcionando en producción con usuarios reales.

La implementación fue validada no solo por el desarrollador sino también por una usuaria externa (sin conocimientos técnicos), cuyas pruebas reales revelaron bugs que de otra forma no se habrían detectado (BUG-05, BUG-06).
# Historias de Usuario — Chatbot de Captación de Cotizaciones
### Seguros Germán Perez · Proceso TO-BE (Lane: Chatbot WhatsApp)

**Épica:** Automatizar la etapa de captación inicial de datos para cotizaciones de seguro de Auto/Moto vía WhatsApp, eliminando la demora de respuesta manual del broker.

**Roles involucrados:**
- **Cliente** — persona que solicita una cotización
- **Sistema (Bot)** — chatbot de WhatsApp que guía la conversación
- **Broker (Germán)** — recibe los datos ya capturados y continúa el proceso de cotización

---

## HU-01 · Inicio de conversación y bienvenida

**Como** cliente que escribe por primera vez al WhatsApp de Seguros Germán Perez,
**quiero** recibir un mensaje de bienvenida automático inmediato,
**para** saber que mi consulta fue recibida y entender qué puedo hacer a continuación.

**Criterios de aceptación:**

```gherkin
Dado que un cliente envía cualquier primer mensaje al número de WhatsApp del negocio
Cuando no existe una conversación activa previa con ese número
Entonces el bot responde en menos de 5 segundos con un mensaje de bienvenida
Y el mensaje incluye el nombre del negocio y una breve explicación de qué puede hacer el bot

Dado que el cliente ya recibió el mensaje de bienvenida
Cuando el bot continúa la conversación
Entonces le presenta las opciones de tipo de seguro mediante un mensaje interactivo (lista o botones)
```

---

## HU-02 · Selección del tipo de seguro

**Como** cliente,
**quiero** poder elegir qué tipo de seguro necesito de una lista de opciones,
**para** que el bot me pida solo los datos relevantes a mi caso.

**Criterios de aceptación:**

```gherkin
Dado que el bot mostró las opciones de tipo de seguro (Auto/Moto, Hogar, Comercio, General)
Cuando el cliente selecciona "Auto/Moto"
Entonces el bot avanza al flujo de captura de datos del vehículo

Dado que el cliente selecciona una opción no disponible en el MVP (Hogar, Comercio, General)
Cuando el bot recibe esa selección
Entonces responde indicando que por el momento ese tipo de seguro se gestiona directamente con el broker
Y ofrece la opción de dejar sus datos de contacto para que Germán lo llame

Dado que el cliente envía texto libre en vez de tocar un botón
Cuando el bot no reconoce la opción
Entonces repite las opciones válidas sin avanzar el flujo
```

---

## HU-03 · Captura de datos del vehículo

**Como** cliente que ya eligió cotizar Auto/Moto,
**quiero** que el bot me pida uno a uno los datos de mi vehículo,
**para** completar la información sin confusión y sin tener que escribir todo junto.

**Criterios de aceptación:**

```gherkin
Dado que el cliente seleccionó "Auto/Moto"
Cuando el bot inicia la captura de datos
Entonces pide, en este orden: patente, marca, y código postal
Y espera la respuesta del cliente antes de pasar al siguiente dato

Dado que el bot pide la patente
Cuando el cliente ingresa un valor con formato inválido (ej. muy corto, con caracteres no permitidos)
Entonces el bot le informa el formato esperado y vuelve a pedir el dato
Y no avanza al siguiente campo hasta recibir un valor válido

Dado que el bot pide el código postal
Cuando el cliente ingresa un valor no numérico
Entonces el bot solicita nuevamente el dato aclarando que debe ser numérico
```

---

## HU-04 · Consulta de aseguradora preferida

**Como** cliente,
**quiero** poder indicar si tengo una aseguradora en mente o pedir recomendación,
**para** recibir una cotización más alineada a lo que busco.

**Criterios de aceptación:**

```gherkin
Dado que el cliente completó los datos del vehículo
Cuando el bot pregunta por la aseguradora preferida
Entonces muestra las opciones disponibles (ej. Rivadavia, Mapfre, Triunfo) más la opción "No sé, recomendame"

Dado que el cliente selecciona "No sé, recomendame"
Cuando el bot recibe esa selección
Entonces muestra un resumen breve de pros y contras de cada aseguradora disponible
Y vuelve a pedir que elija una opción

Dado que el cliente no selecciona ninguna aseguradora específica luego de ver la recomendación
Cuando pasa un tiempo definido sin respuesta
Entonces el bot asume Triunfo como aseguradora por defecto y continúa el flujo
```

---

## HU-05 · Guardado de datos y notificación al broker

**Como** broker (Germán),
**quiero** que los datos capturados por el bot queden guardados y accesibles,
**para** poder retomar la cotización en cuanto esté disponible, sin tener que volver a pedir nada al cliente.

**Criterios de aceptación:**

```gherkin
Dado que el cliente completó todos los pasos del flujo de captación
Cuando el bot recibe el último dato requerido
Entonces guarda una nueva fila en la planilla de Google Sheets con: fecha/hora, nombre, teléfono, tipo de seguro, patente, marca, código postal, aseguradora preferida

Dado que los datos ya fueron guardados en la planilla
Cuando se completa el guardado exitosamente
Entonces el bot envía al cliente un mensaje de cierre confirmando que sus datos fueron recibidos y que el broker se contactará a la brevedad

Dado que el guardado en Google Sheets falla por un error técnico
Cuando el bot detecta el error
Entonces reintenta el guardado y, si vuelve a fallar, conserva los datos en el estado de la conversación para no perderlos

Dado que los datos ya fueron guardados en la planilla
Cuando se completa el guardado exitosamente
Entonces el sistema envía a Sandra una notificación por WhatsApp (usando una plantilla pre-aprobada por Meta) con un resumen del nuevo lead: nombre, tipo de seguro y aseguradora preferida

Dado que el envío de la notificación a Sandra falla
Cuando el sistema detecta el error de envío
Entonces el dato ya guardado en Sheets no se pierde — la planilla sigue siendo la fuente de verdad, la notificación es solo un aviso adicional
```

---

## HU-06 · Conversación abandonada a mitad del flujo

**Como** broker (Germán),
**quiero** identificar cuándo un cliente empezó pero no terminó de dar sus datos,
**para** poder hacer seguimiento manual si lo considero necesario.

**Criterios de aceptación:**

```gherkin
Dado que un cliente inició el flujo de captación
Cuando no responde ningún mensaje durante más de 24 horas
Entonces el bot marca la conversación como "abandonada" en el registro
Y no vuelve a insistir automáticamente (evita spam)

Dado que una conversación quedó marcada como abandonada
Cuando el cliente vuelve a escribir después de ese lapso
Entonces el bot reinicia el flujo de captación desde el inicio
```

---

## HU-07 · Conversación abandonada a mitad del flujo

**Como** cliente que ya recibió una primera cotización, 
**quiero** poder pedir que también me coticen en otra aseguradora, 
**para** comparar precios antes de decidir sin tener que volver a dar mis datos desde cero.

**Criterios de aceptación:**

```gherkin
Dado que el cliente recibió la cotización de la aseguradora elegida inicialmente
Cuando el broker le pregunta si quiere cotizar en otra compañía
Entonces el cliente puede responder que sí, indicando cuál

Dado que el cliente pidió una cotización adicional en otra aseguradora
Cuando el broker retoma el proceso
Entonces reutiliza los datos ya capturados por el bot (patente, marca, código postal)
Y no vuelve a solicitárselos al cliente

Dado que el broker envió la nueva cotización
Cuando el cliente la recibe
Entonces puede repetir el pedido de otra cotización adicional, confirmar, o no confirmar ninguna (fin del proceso)

---

## Fuera de alcance en esta etapa (MVP)

Las siguientes historias quedan explícitamente fuera del alcance del lane Chatbot en este MVP, y se mantienen como proceso manual del broker (sin cambios respecto al AS-IS):

- Cotización efectiva de precios (Triunfo, Rivadavia, Mapfre, Digna)
- Captura de datos para la contratación de la póliza
- Confirmación de póliza en la web de la aseguradora
- Envío de comprobante de pago y póliza
- Flujos de Hogar, Comercio y General (se documentarán en una fase posterior)

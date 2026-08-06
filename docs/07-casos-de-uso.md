# 07 · Casos de Uso

Modelado formal (estilo UML) de las interacciones principales del sistema. Cada caso de uso corresponde a una o más historias de usuario de `04-historias-de-usuario`, pero se documenta con mayor formalidad: actores, precondiciones, flujo principal, flujos alternativos y postcondiciones.

## Actores

- **Cliente** — persona que inicia una conversación por WhatsApp buscando una cotización
- **Bot** — sistema automatizado que guía la conversación y captura los datos
- **Broker** — Sandra (o Germán), quien recibe los datos ya capturados y continúa el proceso

---

## UC-01 · Iniciar conversación

**Actor primario:** Cliente
**Actor secundario:** Bot

**Precondiciones:** El cliente no tiene una conversación activa previa con el número de WhatsApp del negocio.

**Flujo principal:**
1. El cliente envía un mensaje al WhatsApp del negocio
2. El Bot detecta que no hay conversación activa
3. El Bot responde con un mensaje de bienvenida
4. El Bot presenta las opciones de tipo de seguro

**Postcondiciones:** Se inicia una nueva conversación en estado "esperando tipo de seguro".

---

## UC-02 · Seleccionar tipo de seguro

**Actor primario:** Cliente
**Actor secundario:** Bot

**Precondiciones:** UC-01 completado; conversación en estado "esperando tipo de seguro".

**Flujo principal:**
1. El cliente selecciona "Auto/Moto" de las opciones presentadas
2. El Bot avanza la conversación al estado "captando datos del vehículo"

**Flujos alternativos:**
- **A1 — Tipo de seguro no disponible:** el cliente selecciona Hogar, Comercio o General → el Bot informa que ese tipo se gestiona directamente con el broker y ofrece registrar los datos de contacto para que lo llamen → fin del caso de uso sin avanzar al flujo automatizado
- **A2 — Respuesta no reconocida:** el cliente envía texto libre en vez de tocar una opción → el Bot repite las opciones válidas sin avanzar

**Postcondiciones:** La conversación queda en estado "captando datos del vehículo" (flujo normal) o "derivado a contacto manual" (A1).

---

## UC-03 · Capturar datos del vehículo

**Actor primario:** Cliente
**Actor secundario:** Bot

**Precondiciones:** UC-02 completado con selección de "Auto/Moto".

**Flujo principal:**
1. El Bot solicita la patente
2. El cliente responde con la patente
3. El Bot solicita la marca
4. El cliente responde con la marca
5. El Bot solicita el código postal
6. El cliente responde con el código postal
7. El Bot avanza la conversación al estado "consultando aseguradora preferida"

**Flujos alternativos:**
- **A1 — Formato inválido de patente:** el Bot detecta un formato no válido → informa el formato esperado → vuelve a pedir el dato (repite el paso 1)
- **A2 — Código postal no numérico:** el Bot detecta un valor no numérico → vuelve a pedir el dato (repite el paso 5)

**Postcondiciones:** Patente, marca y código postal quedan registrados en el estado de la conversación.

---

## UC-04 · Seleccionar aseguradora preferida

**Actor primario:** Cliente
**Actor secundario:** Bot

**Precondiciones:** UC-03 completado.

**Flujo principal:**
1. El Bot pregunta si el cliente tiene una aseguradora preferida, mostrando las opciones disponibles
2. El cliente selecciona una aseguradora
3. El Bot avanza la conversación al estado "listo para guardar"

**Flujos alternativos:**
- **A1 — Cliente no tiene preferencia:** el cliente selecciona "No sé, recomendame" → el Bot muestra pros y contras de cada aseguradora → vuelve al paso 2
- **A2 — Cliente no responde:** pasado un tiempo definido sin respuesta → el Bot asigna Triunfo como aseguradora por defecto → continúa al paso 3

**Postcondiciones:** La aseguradora preferida (elegida o por defecto) queda registrada en el estado de la conversación.

---

## UC-05 · Registrar lead y notificar al broker

**Actor primario:** Bot
**Actor secundario:** Broker

**Precondiciones:** UC-04 completado; todos los datos requeridos están capturados.

**Flujo principal:**
1. El Bot guarda un nuevo registro en Google Sheets con los datos capturados
2. El Bot envía al cliente un mensaje de cierre confirmando la recepción de sus datos
3. El sistema envía a Sandra una notificación por WhatsApp (plantilla pre-aprobada) con el resumen del lead
4. El Broker queda con un nuevo lead disponible para revisar, avisado en tiempo real

**Flujos alternativos:**
- **A1 — Falla el guardado:** el guardado en Google Sheets falla → el Bot reintenta → si vuelve a fallar, conserva los datos en el estado de la conversación sin perderlos
- **A2 — Falla la notificación a Sandra:** el envío del WhatsApp de aviso falla → el dato ya guardado en Sheets no se pierde; la planilla sigue siendo la fuente de verdad, la notificación es un aviso complementario

**Postcondiciones:** El lead queda registrado y accesible para el Broker, con un aviso enviado en tiempo real; la conversación automatizada del Bot termina en este punto.

---

## UC-06 · Cotizar en una aseguradora adicional

**Actor primario:** Cliente
**Actor secundario:** Broker

**Precondiciones:** El Broker ya envió al menos una cotización al cliente (fuera del alcance del Bot; proceso manual del Broker).

**Flujo principal:**
1. El Broker pregunta al cliente si quiere cotizar en otra aseguradora
2. El cliente indica cuál
3. El Broker reutiliza los datos ya capturados (patente, marca, código postal) sin volver a pedirlos
4. El Broker cotiza en la nueva aseguradora y envía la cotización al cliente

**Flujos alternativos:**
- **A1 — Cliente no quiere otra cotización:** el cliente confirma la cotización recibida o directamente no confirma ninguna → fin del caso de uso, continúa a contratación o termina el proceso

**Postcondiciones:** El cliente cuenta con una o más cotizaciones para decidir.

---

## UC-07 · Recuperar conversación abandonada

**Actor primario:** Cliente
**Actor secundario:** Bot

**Precondiciones:** Existe una conversación marcada como "abandonada" (sin respuesta del cliente por más de 24 horas desde UC-01, UC-02, UC-03 o UC-04).

**Flujo principal:**
1. El cliente vuelve a escribir al WhatsApp del negocio
2. El Bot detecta que la conversación previa está marcada como abandonada
3. El Bot reinicia el flujo desde UC-01

**Postcondiciones:** Se inicia una conversación nueva; los datos parciales de la conversación abandonada no se reutilizan.

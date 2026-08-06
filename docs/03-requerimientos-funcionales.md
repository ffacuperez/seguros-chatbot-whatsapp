# 03 · Requerimientos

## Requerimientos funcionales

| ID | Descripción | Prioridad | HU relacionada |
|---|---|---|---|
| RF-01 | El sistema debe enviar un mensaje de bienvenida automático al recibir el primer mensaje de un cliente sin conversación activa previa | Alta | HU-01 |
| RF-02 | El sistema debe presentar el mensaje de bienvenida en menos de 5 segundos desde la recepción del mensaje del cliente | Alta | HU-01 |
| RF-03 | El sistema debe presentar las opciones de tipo de seguro (Auto/Moto, Hogar, Comercio, General) mediante un mensaje interactivo con botones o lista | Alta | HU-02 |
| RF-04 | Si el cliente selecciona un tipo de seguro no disponible en el MVP (Hogar, Comercio, General), el sistema debe informarlo y ofrecer dejar datos de contacto para que Germán/Sandra lo contacten directamente | Alta | HU-02 |
| RF-05 | Si el cliente selecciona "Auto/Moto", el sistema debe avanzar al flujo de captura de datos del vehículo | Alta | HU-02 |
| RF-06 | El sistema debe solicitar, en este orden, patente, marca y código postal, esperando la respuesta del cliente antes de pedir el siguiente dato | Alta | HU-03 |
| RF-07 | El sistema debe validar el formato de la patente ingresada y volver a solicitarla si no cumple el formato esperado | Media | HU-03 |
| RF-08 | El sistema debe validar que el código postal ingresado sea numérico y volver a solicitarlo si no lo es | Media | HU-03 |
| RF-09 | El sistema debe preguntar al cliente si tiene una aseguradora preferida, mostrando las opciones disponibles más la alternativa "No sé, recomendame" | Alta | HU-04 |
| RF-10 | Si el cliente elige "No sé, recomendame", el sistema debe mostrar un resumen de pros y contras de cada aseguradora antes de volver a preguntar | Alta | HU-04 |
| RF-11 | Si el cliente no selecciona ninguna aseguradora luego de un tiempo definido, el sistema debe asignar Triunfo como aseguradora por defecto y continuar el flujo | Alta | HU-04 |
| RF-12 | Al completarse todos los datos requeridos, el sistema debe guardar un nuevo registro en Google Sheets con fecha/hora, nombre, teléfono, tipo de seguro, patente, marca, código postal y aseguradora preferida | Alta | HU-05 |
| RF-13 | El sistema debe confirmarle al cliente, mediante un mensaje de cierre, que sus datos fueron recibidos y que será contactado a la brevedad | Alta | HU-05 |
| RF-14 | Si el guardado en Google Sheets falla, el sistema debe reintentarlo y, de persistir el error, conservar los datos en el estado de la conversación para no perderlos | Media | HU-05 |
| RF-15 | El sistema debe marcar como "abandonada" toda conversación iniciada que no reciba respuesta del cliente durante más de 24 horas, sin reenviar mensajes automáticos adicionales | Baja | HU-06 |
| RF-16 | Si un cliente con una conversación marcada como abandonada vuelve a escribir, el sistema debe reiniciar el flujo de captación desde el inicio | Baja | HU-06 |
| RF-17 | Una vez recibida la cotización, el sistema (broker) debe poder ofrecerle al cliente cotizar en una aseguradora adicional, repitiendo la actividad de cotización sin volver a pedir los datos ya capturados | Media | Derivado del ajuste al TO-BE (ver `06-proceso-to-be`) |
| RF-18 | Al completarse el guardado exitoso del lead en Google Sheets, el sistema debe notificar a Sandra por WhatsApp mediante una plantilla pre-aprobada, con nombre, tipo de seguro y aseguradora preferida del lead | Alta | HU-05 |
| RF-19 | Si el envío de la notificación a Sandra falla, el sistema no debe perder ni reintentar sobrescribir el dato ya guardado en Sheets — la planilla es la fuente de verdad, la notificación es un aviso complementario | Medio | HU-05 |

## Requerimientos no funcionales

| ID | Descripción |
|---|---|
| RNF-01 | El sistema debe operar en idioma español (Argentina) |
| RNF-02 | El sistema debe estar disponible las 24 horas, los 7 días de la semana |
| RNF-03 | El cliente no debe necesitar instalar ninguna aplicación adicional: la interacción ocurre íntegramente dentro de WhatsApp |
| RNF-04 | Los datos capturados deben quedar accesibles para Germán/Sandra sin requerir conocimientos técnicos (Google Sheets como interfaz de consulta) |
| RNF-05 | El sistema debe usar la WhatsApp Cloud API oficial de Meta, evitando integraciones no oficiales que puedan derivar en el bloqueo del número de WhatsApp del negocio |
| RNF-06 | Los datos personales capturados (nombre, teléfono, patente) deben almacenarse de forma que solo Germán/Sandra tengan acceso |
| RNF-07 |	La plantilla de notificación a Sandra debe estar pre-aprobada en Meta Business Manager antes de salir a producción, ya que es un mensaje iniciado por el negocio y no por el cliente

## Trazabilidad

Todos los RF están numerados con su HU de origen para mantener trazabilidad completa entre necesidad de negocio (Historia de Usuario) y requerimiento formal (RF). El RF-17 es la excepción: surge de un ajuste posterior al proceso TO-BE (agregar la posibilidad de cotizar en una segunda aseguradora tras ver la primera cotización) y todavía no tiene una HU formal escrita — queda pendiente redactarla en `04-historias-de-usuario` como HU-07.

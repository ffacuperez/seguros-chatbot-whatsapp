# 08 · Arquitectura Técnica

![Diagrama de componentes](img/arquitectura-componentes.svg)

## Componentes

### WhatsApp Cloud API (Meta)
Canal único de comunicación, en ambas direcciones: recibe los mensajes del cliente (vía webhook) y envía tanto las respuestas del bot como la notificación de nuevo lead a Sandra. Se conecta directo con Meta, sin intermediarios (Twilio u otro BSP), tal como se definió en `01-contexto-y-objetivos`. Requiere activar **Coexistence** para que el número siga funcionando también desde la app de WhatsApp Business que usa Sandra hoy.

### Backend (Node.js + Express)
Es el cerebro del sistema. Recibe cada evento del webhook de Meta, determina en qué paso del flujo está esa conversación (según el estado guardado en Redis) y decide qué responder. También es responsable de escribir en Google Sheets al cerrar el flujo, y de disparar la notificación a Sandra.

### Redis (Upstash)
Guarda el estado de cada conversación en curso: en qué paso está, qué datos ya se capturaron. Se eligió un almacenamiento externo (en vez de guardar el estado en memoria del propio backend) porque si el backend se reinicia o corre en un entorno serverless, la memoria interna se pierde — Redis persiste ese estado entre reinicios. Upstash ofrece un plan gratuito más que suficiente para el volumen de este proyecto.

### Google Sheets API
Almacena cada lead ya completo: nombre, teléfono, tipo de seguro, patente, marca, código postal y aseguradora preferida. Se eligió por sobre una base de datos tradicional porque Sandra ya sabe usar Sheets y no necesita aprender una herramienta nueva para revisar sus leads (ver `01-contexto-y-objetivos`, RNF-04).

## Flujo de una conversación

1. El cliente envía un mensaje → Meta lo reenvía al backend vía webhook
2. El backend consulta en Redis si ya existe una conversación con ese número
3. Según el estado, el backend decide la siguiente pregunta o acción (ver `07-casos-de-uso`)
4. El backend responde al cliente a través de la misma WhatsApp Cloud API
5. Al completarse el flujo, el backend escribe el lead en Google Sheets
6. El backend envía la notificación a Sandra por WhatsApp, usando la plantilla pre-aprobada (RF-18)

## Decisiones de arquitectura y alternativas descartadas

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| Meta Cloud API directa | Twilio / otros BSP | Evita un costo adicional innecesario; al ser el cliente quien inicia la conversación, se aprovecha la ventana de servicio gratuita de 24hs |
| Meta Cloud API oficial | whatsapp-web.js / librerías no oficiales | Evita el riesgo de que se banee el número de WhatsApp del negocio, que es una herramienta de trabajo crítica |
| Flujo guiado por botones | Conversación libre interpretada por IA | Más simple, más predecible, y suficiente para los datos estructurados que se necesitan capturar |
| Google Sheets | Base de datos + panel propio | Sandra ya sabe usarlo; no requiere capacitación ni mantenimiento de infraestructura adicional |
| Redis externo (Upstash) | Estado en memoria del backend | El estado sobrevive a reinicios o a un backend corriendo en modo serverless |

## Consideraciones de seguridad

- El webhook de Meta debe validarse con el token de verificación que provee la plataforma, para evitar que terceros envíen eventos falsos al backend
- El acceso a la planilla de Google Sheets debe restringirse solo a las cuentas de Sandra y Germán (ver RNF-06 en `03-requerimientos`)
- Las credenciales de la API (token de acceso de Meta, credenciales de Google) deben guardarse como variables de entorno, nunca en el código fuente del repositorio

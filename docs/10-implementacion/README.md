# 10 · Implementación

Backend del chatbot, en Node.js + Express. Mapea 1 a 1 con el diagrama de componentes UML de `08-arquitectura`, aunque corre como un solo proceso (monolito modular), no como microservicios separados — decisión tomada para el MVP en `01-contexto-y-objetivos`.

## Estructura

```
src/
  server.js                        → arranca el servidor Express
  config.js                        → variables de entorno centralizadas
  webhookGateway.js                → WebhookGateway (punto de entrada de Meta)
  flujoCotizacion.js               → FlujoCotización (la lógica de negocio del flujo)
  services/
    conversationService.js         → ServicioConversacion (orquesta todo)
    leadsService.js                → ServicioLeads
    notificationService.js         → ServicioNotificaciones
  integrations/
    whatsapp.js                    → ServicioIntegracionWhatsApp
    googleSheets.js                → ServicioIntegracionGoogleSheets
  state/
    redisClient.js                 → PersistenciaEstado
  jobs/
    marcarAbandonadas.js           → job programado de HU-06
```

## Instalación

```bash
npm install
cp .env.example .env
# completar .env con las credenciales reales
npm run dev
```

## Variables de entorno pendientes de completar

- `WHATSAPP_TOKEN` y `WHATSAPP_PHONE_NUMBER_ID` — se obtienen del panel de Meta for Developers, una vez configurada la WhatsApp Business Platform (ver `08-arquitectura`)
- `WHATSAPP_NOTIFICATION_TEMPLATE` — el nombre exacto de la plantilla aprobada para notificar a Sandra (RNF-07); mientras no esté aprobada, ese envío va a fallar silenciosamente (está contemplado en `notificationService.js`, no rompe el resto del flujo)
- `REDIS_URL` — la connection string de Upstash (o el proveedor de Redis que se elija)
- `GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` — credenciales de una cuenta de servicio de Google con permiso de edición sobre la planilla de leads

## Pendiente de contenido real (no técnico)

En `flujoCotizacion.js`, el objeto `PROS_Y_CONTRAS_ASEGURADORAS` tiene textos `TODO` — falta que Germán/Sandra definan el contenido real de pros y contras de cada aseguradora (esto ya estaba marcado como pendiente desde `01-contexto-y-objetivos`).

## Qué falta para producción (no incluido en este MVP)

- Tests automatizados (ver `11-testing`)
- Manejo de reintentos más robusto en las integraciones externas
- Un endpoint o panel simple para que Sandra pueda marcar el `Estado` de un lead sin abrir Sheets directamente (posible mejora futura, fuera del alcance actual)

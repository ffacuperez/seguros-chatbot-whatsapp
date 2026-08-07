# Guía de configuración — Variables de entorno

Paso a paso para conseguir cada credencial de `.env.example`. Andá tildando a medida que avanzás.

---

## 1. WhatsApp Cloud API (`WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`)

1. Entrá a [developers.facebook.com](https://developers.facebook.com) y creá una cuenta de developer (con el Facebook del negocio, no uno personal suelto)
2. **Mis Apps → Crear App → tipo "Business"**
3. Dentro de la app, en el panel lateral, agregá el producto **WhatsApp**
4. Meta te va a mostrar automáticamente un **número de prueba temporal**, con un **Temporary access token** y un **Phone Number ID** ya visibles en la pantalla — con eso ya podés probar el bot mandándote mensajes a vos mismo (hay que agregar tu número como "destinatario de prueba" en esa misma pantalla)
5. Ese token temporal dura 24hs, sirve solo para probar. Para producción con el número real de Sandra, hace falta un **token permanente**:
   - Andá a **Meta Business Suite → Configuración del negocio → Usuarios → Usuarios del sistema**
   - Creá un usuario del sistema, asignale la app que creaste
   - Generá un token para ese usuario, con los permisos `whatsapp_business_messaging` y `whatsapp_business_management`, sin fecha de expiración
   - Ese es el valor de `WHATSAPP_TOKEN`
6. El `WHATSAPP_PHONE_NUMBER_ID` real (una vez migrado el número de Sandra con Coexistence, ver `08-arquitectura`) lo encontrás en **WhatsApp → Configuración de la API**, o en Business Settings → Cuentas → Cuentas de WhatsApp

### Configurar el Webhook

1. En el mismo panel de WhatsApp, sección **Configuration**, hay un campo para la **URL del Webhook** y otro para el **Verify Token**
2. La URL tiene que ser pública (`https://tudominio.com/webhook`) — si estás probando en tu PC, usá algo como [ngrok](https://ngrok.com) para exponer tu `localhost` temporalmente con una URL pública
3. El **Verify Token** lo inventás vos (cualquier string), y tiene que coincidir exactamente con el que pongas en `WHATSAPP_VERIFY_TOKEN` del `.env`
4. Suscribite al campo `messages` para que te lleguen los mensajes entrantes

---

## 2. Plantilla de notificación a Sandra (`WHATSAPP_NOTIFICATION_TEMPLATE`)

1. **Meta Business Suite → WhatsApp Manager → Plantillas de mensaje → Crear plantilla**
2. Categoría: **Utility** (no Marketing — se aprueba más rápido y es la categoría correcta para este uso)
3. Nombre: `nuevo_lead_cotizacion` (tiene que ser EXACTAMENTE ese texto, en minúsculas y con guiones bajos, para que coincida con el `.env`)
4. Idioma: Español (Argentina)
5. Cuerpo del mensaje, con 3 variables:
   ```
   🛎️ Nuevo lead: {{1}}, interesado en seguro de {{2}}, prefiere la aseguradora {{3}}. Revisá la planilla para cotizar.
   ```
6. Enviar a revisión — Meta suele aprobar plantillas de Utility en minutos u horas
7. Una vez que el estado pase a **Aprobada**, ya está lista para usarse

---

## 3. Redis / Upstash (`REDIS_URL`)

1. Creá una cuenta gratis en [upstash.com](https://upstash.com)
2. **Create Database → tipo Redis**, elegí una región cercana (ej. us-east-1)
3. En el detalle de la base, copiá el **Redis Connect URL** — tiene este formato:
   ```
   rediss://default:TU_PASSWORD@nombre-region.upstash.io:6379
   ```
4. Ese valor completo va directo en `REDIS_URL`

El plan gratuito de Upstash alcanza sobra para el volumen que va a manejar este bot.

---

## 4. Google Sheets API (`GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`)

1. Andá a [console.cloud.google.com](https://console.cloud.google.com) y creá un proyecto nuevo
2. **APIs y servicios → Biblioteca** → buscá "Google Sheets API" → **Habilitar**
3. **APIs y servicios → Credenciales → Crear credenciales → Cuenta de servicio**
4. Dale un nombre (ej. `broker-chatbot-sheets`) y creála
5. Entrá a esa cuenta de servicio recién creada → pestaña **Claves → Agregar clave → Crear clave nueva → JSON**
6. Se descarga un archivo `.json` — abrilo, ahí adentro están:
   - `client_email` → va en `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → va en `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (respetando los `\n` tal cual vienen en el JSON)
7. Creá la planilla real en Google Sheets, con una hoja llamada exactamente **Leads** y las 9 columnas de `09-modelo-de-datos` como encabezado de la fila 1
8. **Compartí esa planilla** con el email de la cuenta de servicio (el mismo `client_email` del paso 6), dándole permiso de **Editor** — sin este paso, el backend no va a poder escribir nada
9. El `GOOGLE_SHEETS_ID` es el string largo que aparece en la URL de la planilla, entre `/d/` y `/edit`:
   ```
   https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
   ```

---

## 5. Número de Sandra (`SANDRA_WHATSAPP_NUMBER`)

Simplemente su número de WhatsApp en formato internacional, sin el `+` y sin espacios: `549351XXXXXXX`.

---

## Checklist final antes de correr `npm run dev`

- [ ] Token y Phone Number ID de WhatsApp (temporal para probar, o permanente para producción)
- [ ] Webhook configurado y verificado en el panel de Meta
- [ ] Plantilla de notificación aprobada
- [ ] Base de Redis creada en Upstash
- [ ] Cuenta de servicio de Google creada, con la Sheets API habilitada
- [ ] Planilla creada, con la hoja "Leads" y compartida con la cuenta de servicio
- [ ] Todos los valores completados en `.env` (nunca en el código, ni subidos al repositorio)

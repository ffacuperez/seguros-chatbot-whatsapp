# 09 · Modelo de Datos

Este proyecto maneja dos estructuras de datos distintas, con ciclos de vida diferentes:

1. **Sesión de conversación** (Redis) — temporal, vive mientras dura el intercambio con el cliente, se descarta al cerrar el flujo
2. **Lead** (Google Sheets) — permanente, es el registro final que Sandra revisa para cotizar

## 1. Sesión de conversación (Redis)

### Clave

```
session:{telefono}
```

Ejemplo: `session:5493515551234`

### Estructura (JSON)

| Campo | Tipo | Descripción |
|---|---|---|
| `telefono` | string | Número de WhatsApp del cliente, con código de país. Es la clave primaria de la sesión |
| `paso_actual` | enum | En qué punto del flujo está la conversación (ver tabla de estados abajo) |
| `tipo_seguro` | string | `"Auto"` o `"Moto"` (único alcance del MVP) |
| `nombre` | string \| null | Nombre del cliente, si ya fue capturado |
| `patente` | string \| null | Patente del vehículo |
| `marca` | string \| null | Marca del vehículo |
| `codigo_postal` | string \| null | Código postal, para la cotización |
| `aseguradora_preferida` | string \| null | `"Rivadavia"`, `"Mapfre"`, `"Digna"`, `"Triunfo"` (por defecto) |
| `fecha_inicio` | timestamp | Cuándo empezó la conversación |
| `fecha_ultima_interaccion` | timestamp | Se actualiza en cada respuesta del cliente — es lo que usa HU-06 para detectar abandono (más de 24hs sin actualizarse) |
| `estado_conversacion` | enum | `"activa"` \| `"abandonada"` \| `"completada"` |

### Estados de `paso_actual`

| Valor | Corresponde a |
|---|---|
| `bienvenida` | HU-01 — recién se envió el mensaje de bienvenida |
| `esperando_tipo_seguro` | HU-02 — esperando que el cliente elija Auto/Moto/Hogar/Comercio/General |
| `esperando_patente` | HU-03 |
| `esperando_marca` | HU-03 |
| `esperando_codigo_postal` | HU-03 |
| `esperando_aseguradora` | HU-04 |
| `completado` | HU-05 — ya se guardó en Sheets y se notificó a Sandra |

### Tiempo de vida (TTL)

La clave de sesión se configura con un TTL de **48 horas** en Redis. Esto es un mecanismo de limpieza automática, independiente del campo `estado_conversacion`: aunque una sesión se marque como `"abandonada"` a las 24hs (HU-06), sigue existiendo por si el cliente vuelve a escribir y hay que retomarla (UC-07); pasadas las 48hs, Redis la elimina sola y esa conversación, si vuelve, arranca desde cero.

## 2. Lead (Google Sheets)

Una fila por cada conversación completada exitosamente (`estado_conversacion = "completada"`).

### Columnas de la planilla

| Columna | Tipo | Formato | Obligatorio | Ejemplo |
|---|---|---|---|---|
| `Fecha/Hora` | datetime | `DD/MM/AAAA HH:MM` | Sí | `04/08/2026 14:32` |
| `Nombre` | texto | libre | Sí | `Juan Pérez` |
| `Teléfono` | texto | `54 9 351 XXXXXXX` | Sí | `5493515551234` |
| `Tipo de seguro` | texto | `Auto` \| `Moto` | Sí | `Auto` |
| `Patente` | texto | 6-7 caracteres alfanuméricos | Sí | `AB123CD` |
| `Marca` | texto | libre | Sí | `Ford` |
| `Código Postal` | texto | numérico, 4 dígitos | Sí | `5000` |
| `Aseguradora preferida` | texto | `Rivadavia` \| `Mapfre` \| `Digna` \| `Triunfo` | Sí (con default) | `Triunfo` |
| `Estado` | texto | `Pendiente` \| `Cotizado` \| `Cerrado` | Sí, default `Pendiente` | `Pendiente` |

La columna `Estado` no la llena el bot — es de uso manual de Sandra, para que pueda marcar en la misma planilla en qué punto quedó cada lead una vez que ella retoma el proceso manual (cotizar, contratar, etc.). No está atada a ningún requerimiento funcional del bot, pero vale la pena dejarla desde el diseño para que la planilla también sirva como panel de seguimiento.

## Relación entre ambas estructuras

Cuando `ServicioConversacion` llega a `paso_actual = completado`, ocurre lo siguiente:

1. Se toma el contenido completo de la sesión en Redis
2. Se transforma al formato de fila de Sheets (se descartan `paso_actual`, `fecha_ultima_interaccion` y `estado_conversacion`, que son propios del control de la conversación y no le sirven a Sandra)
3. Se agrega la columna `Estado = Pendiente`
4. Se envía a `ServicioLeads` → `ServicioIntegracionGoogleSheets` para persistir la fila
5. La sesión en Redis pasa a `estado_conversacion = "completada"` y queda con su TTL corriendo hasta que expire sola

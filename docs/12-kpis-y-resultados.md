# 12 · KPIs y Resultados

## Métricas de éxito

KPIs definidos para medir el impacto real del chatbot una vez en producción con clientes reales. Cada métrica está vinculada al objetivo de negocio que justifica el proyecto (ver `01-contexto-y-objetivos`).

### KPI-01 · Tiempo de primera respuesta

| Aspecto | Detalle |
|---|---|
| **Qué mide** | Cuánto tarda el cliente en recibir la primera interacción después de escribir |
| **Antes (AS-IS)** | Variable, depende de la disponibilidad de Sandra/Germán — puede ir de minutos a horas |
| **Meta (TO-BE)** | Menos de 5 segundos (ver RF-02) |
| **Resultado real** | En condiciones normales (servidor activo): respuesta en 1-3 segundos. Con cold start de Render en plan gratuito: hasta 4 minutos en el peor caso observado |
| **Cómo se mide** | Timestamp del mensaje entrante vs. timestamp del primer mensaje de respuesta en los logs de Render |
| **Acción pendiente** | Migrar a un plan pago de Render (~USD 7/mes) para eliminar el cold start y cumplir la meta de 5 segundos de forma consistente |

### KPI-02 · Tasa de completitud del flujo

| Aspecto | Detalle |
|---|---|
| **Qué mide** | Porcentaje de conversaciones que llegan desde el primer mensaje hasta el guardado exitoso del lead en Sheets |
| **Meta** | Mayor al 70% (benchmark razonable para un formulario conversacional guiado por botones) |
| **Resultado real** | Aún sin volumen suficiente para medir con confianza estadística — pendiente de medición una vez que lleguen clientes reales |
| **Cómo se mide** | Leads guardados en Sheets (columna `Estado = Pendiente`) / total de sesiones creadas en Redis en el mismo período |

### KPI-03 · Tasa de abandono

| Aspecto | Detalle |
|---|---|
| **Qué mide** | Porcentaje de conversaciones iniciadas que no se completan (marcadas como `abandonada` por el job de HU-06) |
| **Meta** | Menor al 30% (inversa de KPI-02) |
| **Resultado real** | Pendiente de medición |
| **Cómo se mide** | Sesiones marcadas como `abandonada` / total de sesiones creadas en el mismo período |
| **Observación** | Si esta tasa resulta alta, es el indicador más directo de que el flujo tiene demasiados pasos o las preguntas no son claras — ver `04-historias-de-usuario` para ajustar |

### KPI-04 · Leads captados por semana

| Aspecto | Detalle |
|---|---|
| **Qué mide** | Volumen de leads nuevos que llegan a la planilla de Sheets por semana |
| **Antes (AS-IS)** | No se medía — los leads llegaban mezclados en el historial de WhatsApp sin registro centralizado |
| **Meta** | Establecer una línea base en las primeras 4 semanas de operación, luego medir crecimiento |
| **Resultado real** | Pendiente de medición |
| **Cómo se mide** | Contar filas nuevas en Sheets agrupadas por semana (columna `Fecha/Hora`) |

### KPI-05 · Tasa de conversión (lead → póliza)

| Aspecto | Detalle |
|---|---|
| **Qué mide** | Porcentaje de leads captados que terminan en una póliza contratada |
| **Meta** | Establecer línea base — no hay dato previo porque antes no se medía |
| **Resultado real** | Pendiente de medición |
| **Cómo se mide** | Leads con `Estado = Cerrado` en Sheets / total de leads en el mismo período |
| **Observación** | Esta métrica depende 100% de la gestión manual de Sandra/Germán (cotizar, asesorar, cerrar) — el bot no la afecta directamente, pero la visibiliza por primera vez |

### KPI-06 · Tiempo de Sandra liberado

| Aspecto | Detalle |
|---|---|
| **Qué mide** | Reducción estimada del tiempo que Sandra dedica a recopilar datos manualmente por cada lead |
| **Antes (AS-IS)** | ~5-10 minutos por lead (ida y vuelta de mensajes: patente, marca, código postal, aseguradora preferida) |
| **Meta (TO-BE)** | 0 minutos — el bot captura todos los datos antes de que Sandra intervenga |
| **Resultado real** | Confirmado en producción: Sandra recibe la notificación con los datos ya completos, sin haber interactuado con el cliente |
| **Cómo se mide** | Cualitativo — preguntar a Sandra si sigue teniendo que pedir datos a mano o si la planilla le llega completa |

## Resultados del proceso de desarrollo

Métricas del propio proyecto, relevantes para el portfolio de análisis funcional.

| Métrica | Valor |
|---|---|
| Historias de usuario documentadas | 7 (HU-01 a HU-07) |
| Requerimientos funcionales trazados | 19 (RF-01 a RF-19) + 7 no funcionales |
| Casos de uso formales | 7 (UC-01 a UC-07) |
| Casos de prueba | 12 (TC-01 a TC-12), 11 pasados en producción |
| Bugs encontrados y resueltos | 9 (BUG-01 a BUG-09), incluyendo 2 encontrados por una usuaria externa |
| Iteraciones de backlog | 3 definidas, Iteración 1 completa en producción |
| Artefactos de documentación | 12 carpetas, todas con contenido real (no placeholders) |

## Líneas de mejora para iteraciones futuras

Surgidas durante el desarrollo y el testing, priorizadas por impacto:

1. **Migrar Render a plan pago** — elimina el cold start, que es el problema de UX más visible para el cliente. Costo: ~USD 7/mes
2. **Agregar ramas de Hogar, Comercio y General** — hoy se derivan a contacto manual; el flujo ya tiene la estructura para expandirse (ver `05-backlog`, Iteración 2+)
3. **Implementar RF-11 con timeout real** — asignar Triunfo automáticamente tras X minutos sin respuesta en el paso de aseguradora, en vez de solo esperar al abandono de 24hs
4. **Panel de seguimiento propio** — reemplazar la columna `Estado` manual de Sheets con un mini-panel web que Sandra pueda usar sin abrir la planilla
5. **Métricas automatizadas** — dashboard que calcule KPI-02/03/04/05 automáticamente en vez de contar filas a mano

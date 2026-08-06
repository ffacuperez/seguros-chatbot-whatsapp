# 05 · Backlog

Priorización de las historias de usuario del lane Chatbot, pensada para desarrollo incremental: cada iteración deja el bot en un estado funcional y probable de usar, aunque incompleto.

## Criterio de priorización

- **Alta**: sin esto, el bot no cumple su función mínima (captar un lead completo y avisar al broker)
- **Media**: mejora la calidad del dato capturado o la experiencia, pero el bot funciona sin ello
- **Baja**: casos borde o de mantenimiento, no bloquean el uso en producción

## Iteración 1 — Flujo mínimo funcional

| Orden | Historia | Prioridad | Motivo |
|---|---|---|---|
| 1 | HU-01 · Inicio de conversación y bienvenida | Alta | Punto de entrada obligatorio de cualquier conversación |
| 2 | HU-02 · Selección del tipo de seguro | Alta | Define si el cliente sigue el flujo automatizado o se deriva a contacto manual |
| 3 | HU-03 · Captura de datos del vehículo | Alta | Es el dato mínimo indispensable para que Germán/Sandra puedan cotizar |
| 4 | HU-05 · Guardado de datos y notificación al broker | Alta | Sin esto, el bot capta datos pero no los entrega a nadie — es el cierre del ciclo |

**Al final de la Iteración 1, el bot ya es funcional de punta a punta** (aunque sin preguntar aseguradora preferida: se asume Triunfo siempre por defecto).

## Iteración 2 — Mejora de la calidad del lead

| Orden | Historia | Prioridad | Motivo |
|---|---|---|---|
| 5 | HU-04 · Consulta de aseguradora preferida | Alta | Evita que Germán/Sandra tengan que preguntarlo después manualmente; suma valor a cada lead |
| 6 | HU-07 · Cotización en una aseguradora adicional | Media | Depende de que HU-04 ya esté funcionando; mejora la experiencia post-cotización |

## Iteración 3 — Robustez y mantenimiento

| Orden | Historia | Prioridad | Motivo |
|---|---|---|---|
| 7 | HU-06 · Conversación abandonada a mitad del flujo | Baja | No bloquea el uso normal; evita que queden leads a medio cargar sin que nadie lo note |

## Resumen visual

```
Iteración 1 (bloqueante)     ████████████████████  HU-01, HU-02, HU-03, HU-05
Iteración 2 (valor agregado) ████████████          HU-04, HU-07
Iteración 3 (robustez)       ████                  HU-06
```

## Fuera del backlog actual

Las ramas de Hogar, Comercio y General no entran en este backlog: se documentarán y priorizarán como un backlog separado una vez validada la Iteración 1 en producción con Auto/Moto.

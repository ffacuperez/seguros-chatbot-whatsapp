# 01 · Contexto y Objetivos

## Descripción del negocio

**Seguros Germán Perez** es un estudio unipersonal de correduría de seguros, con sede en Braun Menéndez 2579, Bº Centro América, Córdoba Capital. Germán Perez es **Productor Asesor de Seguros** (Matrícula Nº 104343), lo que significa que trabaja de forma independiente y puede ofrecer productos de múltiples compañías aseguradoras en lugar de estar atado a una sola. Su esposa, Sandra Gudiño, se dedica a la captación de datos y cotización de seguros

Su cartera de aseguradoras incluye, al menos por ahora, **Triunfo** (compañía de cotización por defecto, precio intermedio), **Rivadavia** (posicionada como opción de gama alta), **Mapfre** (opción de precio más bajo) y **Digna** (Opción semejante a Mapfre).

### Rol de Sandra en el proceso

Sandra cumple, hoy, todos los roles del proceso de venta de manera manual:
- Recibe la consulta del cliente por WhatsApp
- Releva los datos necesarios para cotizar
- Carga esos datos en el sistema de la aseguradora elegida (o Triunfo por defecto)
- Comunica el resultado al cliente
- Gestiona la contratación, el pago y la entrega de la póliza

No cuenta herramientas de automatización: todo el circuito depende de su disponibilidad personal.

## Problema a resolver

El cuello de botella identificado no está en la calidad del asesoramiento ni en los precios que ofrece Germán, sino en el **tiempo de primera respuesta**. Cuando un cliente potencial escribe pidiendo una cotización, la conversación no avanza hasta que Sandra esté disponible para leer el mensaje y empezar, a mano, a pedir los datos uno por uno.

Esto genera dos problemas concretos:
1. **Demora en la primera respuesta**, que en un mercado donde el cliente suele consultar a más de un corredor en paralelo, puede significar perder la venta frente a alguien que responda antes.
2. **Tiempo de Sandra consumido en tareas repetitivas de bajo valor** (preguntar patente, marca, año, etc.) en lugar de dedicarlo a lo que realmente requiere su criterio profesional que es elegir la mejor cobertura y cerrar la venta.

## Objetivo del proyecto

Automatizar la **etapa de captación inicial de datos** mediante un chatbot de WhatsApp, de forma que un cliente pueda dejar cargados todos los datos necesarios para cotizar en cualquier momento del día, sin depender de que Sandra esté disponible en ese instante.

### Beneficios esperados

- **Reducción del tiempo de primera respuesta** a segundos, las 24 horas, los 7 días de la semana
- **Menos fricción para el cliente**, que completa un flujo guiado por botones en vez de un ida y vuelta de mensajes de texto
- **Liberación de tiempo de Sandra**, que pasa a dedicarse exclusivamente a cotizar y asesorar, no a recolectar datos
- **Registro estructurado y centralizado** de todos los leads en una planilla, sin depender de que la información quede dispersa en el historial de chats de WhatsApp
- **Base para medir el negocio**: al quedar todo registrado, se pueden sacar métricas que hoy no existen (cuántas consultas llegan por semana, cuántas se convierten en pólizas, etc. — ver `12-kpis-y-resultados`)

## Alcance de este MVP

### Incluido en esta etapa

- Automatización de la captación de datos para seguros de **Auto y Moto** exclusivamente
- Recolección de: nombre, tipo de seguro, patente, marca, código postal y aseguradora preferida (o recomendación automática si el cliente no tiene una preferencia)
- Registro de los datos capturados en Google Sheets
- Aviso a Sandra de que hay un nuevo lead esperando ser cotizado

### Fuera de alcance en esta etapa

- **Hogar, Comercio y General/Vida** — quedan para una segunda iteración del proyecto, una vez validado el flujo de Auto/Moto
- **Cotización efectiva de precios** — sigue siendo 100% manual, a cargo de Sandra, cargando los datos en el sistema de la aseguradora
- **Contratación de la póliza, pago y emisión** — se mantiene sin cambios respecto al proceso actual
- **Interpretación de lenguaje natural libre** — el bot funciona con un flujo guiado por botones, no responde preguntas abiertas ni mantiene una conversación libre

## Stakeholders

| Stakeholder | Rol en el proyecto |
|---|---|
| **Cliente** | Usuario final del chatbot; inicia la conversación buscando una cotización |
| **Germán Perez** | Dueño del negocio; usuario del sistema del lado del broker;
| **Sandra Gudiño** | Responsable del proceso | Valida requerimientos y prioriza funcionalidades | Usuario del sistema del lado del broker;
| **Facu** | Desarrollador y analista funcional del proyecto; responsable del diseño del proceso, la documentación y la implementación técnica |

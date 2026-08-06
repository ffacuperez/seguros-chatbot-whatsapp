# Chatbot de Captación de Leads — Seguros Germán Perez

Automatización de la etapa de captación inicial de datos para cotizaciones de seguro de Auto/Moto, mediante un chatbot de WhatsApp, para el estudio de correduría de seguros **Germán Perez** (Córdoba Capital).

## El problema

Hoy, cada consulta de un cliente potencial depende de que Sandra (encargada de cotizar) esté disponible para responder y pedir los datos uno por uno por WhatsApp. Esto genera demoras en la primera respuesta —clave en un mercado donde el cliente suele consultar a varios corredores en paralelo— y consume tiempo de Sandra en tareas repetitivas de bajo valor.

## La solución

Un bot de WhatsApp que guía al cliente con un flujo de botones, captura los datos necesarios para cotizar (tipo de seguro, patente, marca, código postal, aseguradora preferida) las 24 horas, los 7 días de la semana, los registra en Google Sheets y notifica automáticamente al broker. La cotización y contratación siguen siendo manuales en este MVP.

## Estado del proyecto

- [x] Relevamiento y documentación funcional
- [ ] Implementación del bot
- [ ] Testing
- [ ] Medición de KPIs en producción

Por ahora este repo contiene el análisis funcional completo. La implementación, el testing y los resultados/KPIs se irán subiendo en las próximas etapas.

## Documentación

| # | Documento | Contenido |
|---|---|---|
| 01 | [Contexto y objetivos](docs/01-contexto-y-objetivos.md) | Descripción del negocio, problema, objetivos, alcance del MVP y stakeholders |
| 02 | [Proceso AS-IS](docs/02-proceso-as-is.md) | Cómo funciona hoy el proceso de cotización, 100% manual |
| 03 | [Requerimientos funcionales](docs/03-requerimientos-funcionales.md) | RF y RNF, con trazabilidad a las historias de usuario |
| 04 | [Historias de usuario](docs/04-historias-de-usuario.md) | HU-01 a HU-07 con criterios de aceptación en formato Gherkin |
| 05 | [Backlog](docs/05-backlog.md) | Priorización de historias por iteración de desarrollo |
| 06 | [Proceso TO-BE](docs/06-proceso-to-be.md) | Proceso propuesto con el bot incorporado, comparado contra el AS-IS |
| 07 | [Casos de uso](docs/07-casos-de-uso.md) | Modelado UML de actores, flujos principales y alternativos |
| 08 | [Arquitectura técnica](docs/08-arquitectura.md) | Componentes (WhatsApp Cloud API, backend, Redis, Google Sheets), flujo de una conversación y decisiones de diseño |
| 09 | [Modelo de datos](docs/09-modelo-de-datos.md) | Estructura de la sesión en Redis y de la planilla de leads en Google Sheets |

## Stack técnico

- **WhatsApp Cloud API (Meta)** — canal de mensajería, directo sin BSP intermediario
- **Backend:** Node.js + Express
- **Redis (Upstash)** — estado de conversación en curso
- **Google Sheets API** — almacenamiento de leads

Ver el detalle y las alternativas descartadas en [08-arquitectura](docs/08-arquitectura.md).

## Autor

**Facu** — desarrollador y analista funcional del proyecto.

## Licencia

Este proyecto está bajo la licencia MIT — ver [LICENSE](LICENSE).

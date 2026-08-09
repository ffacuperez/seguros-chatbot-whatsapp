import { config } from './config.js';

// Formato esperado de patente argentina: viejo (ABC123) o mercosur (AB123CD) - RF-07
const REGEX_PATENTE = /^[A-Z]{3}\d{3}$|^[A-Z]{2}\d{3}[A-Z]{2}$/i;
const REGEX_CODIGO_POSTAL = /^\d{4}$/; // RF-08

/**
 * Texto de pros/contras por aseguradora - PENDIENTE de contenido real,
 * a completar con lo que Germán/Sandra definan (ver 01-contexto-y-objetivos).
 */
const PROS_Y_CONTRAS_ASEGURADORAS = {
  Rivadavia: 'TODO: pros y contras a definir con Germán/Sandra',
  Mapfre: 'TODO: pros y contras a definir con Germán/Sandra',
  Digna: 'TODO: pros y contras a definir con Germán/Sandra',
  Triunfo: 'TODO: pros y contras a definir con Germán/Sandra',
};

/**
 * Procesa un mensaje entrante según el paso actual de la sesión.
 * Devuelve { session actualizada, acciones a ejecutar (mensajes a enviar, o guardar lead) }.
 *
 * Este archivo es, a propósito, el único lugar donde vive la lógica de negocio del flujo -
 * ServicioConversacion (services/conversationService.js) solo orquesta, no decide.
 */
export function procesarPaso(session, mensajeEntrante) {
  switch (session.paso_actual) {
    case 'bienvenida':
      return manejarBienvenida(session);

    case 'esperando_tipo_seguro':
      return manejarTipoSeguro(session, mensajeEntrante);

    case 'esperando_patente':
      return manejarPatente(session, mensajeEntrante);

    case 'esperando_marca':
      return manejarMarca(session, mensajeEntrante);

    case 'esperando_codigo_postal':
      return manejarCodigoPostal(session, mensajeEntrante);

    case 'esperando_aseguradora':
      return manejarAseguradora(session, mensajeEntrante);

    default:
      // Sesión ya completada u otro estado inesperado - se reinicia (UC-07)
      return manejarBienvenida({ ...session, paso_actual: 'bienvenida' });
  }
}

// HU-01
function manejarBienvenida(session) {
  session.paso_actual = 'esperando_tipo_seguro';
  return {
    session,
    acciones: [
      {
        tipo: 'texto',
        contenido:
          '¡Hola! 👋 Soy el asistente virtual de Seguros Germán Perez. Te ayudo a dejar cargados los datos para tu cotización.',
      },
      {
        tipo: 'botones',
        cuerpo: '¿Qué querés asegurar?',
        botones: [
          { id: 'tipo_auto_moto', titulo: 'Auto / Moto' },
          { id: 'tipo_otro', titulo: 'Otro seguro' },
        ],
      },
    ],
  };
}

// HU-02 - RF-03, RF-04, RF-05
function manejarTipoSeguro(session, mensaje) {
  if (mensaje?.valor === 'tipo_auto_moto') {
    session.tipo_seguro = 'Auto/Moto';
    session.paso_actual = 'esperando_patente';
    return {
      session,
      acciones: [{ tipo: 'texto', contenido: 'Buenísimo. Empecemos con los datos del vehículo.\n\n¿Cuál es la *patente*?' }],
    };
  }

  if (mensaje?.valor === 'tipo_otro') {
    // A1 de UC-02: se deriva a contacto manual, no sigue el flujo automatizado
    session.paso_actual = 'derivado_manual';
    session.estado_conversacion = 'completada';
    return {
      session,
      acciones: [
        {
          tipo: 'texto',
          contenido:
            'Por el momento ese tipo de seguro lo gestionamos directo con vos 🙂. Dejame tu nombre y te contactamos a la brevedad.',
        },
      ],
      derivarManual: true,
    };
  }

  // A2 de UC-02: opción no reconocida
  return {
    session,
    acciones: [
      {
        tipo: 'botones',
        cuerpo: 'No entendí esa opción. ¿Qué querés asegurar?',
        botones: [
          { id: 'tipo_auto_moto', titulo: 'Auto / Moto' },
          { id: 'tipo_otro', titulo: 'Otro seguro' },
        ],
      },
    ],
  };
}

// HU-03 - RF-06, RF-07
function manejarPatente(session, mensaje) {
  const valor = (mensaje?.valor || '').trim();

  if (!REGEX_PATENTE.test(valor)) {
    return {
      session,
      acciones: [
        {
          tipo: 'texto',
          contenido: 'Ese formato de patente no me cierra 🤔. Probá con el formato AB123CD o ABC123.',
        },
      ],
    };
  }

  session.patente = valor.toUpperCase();
  session.paso_actual = 'esperando_marca';
  return {
    session,
    acciones: [{ tipo: 'texto', contenido: '¿Y la *marca* del vehículo?' }],
  };
}

// HU-03 - RF-06
function manejarMarca(session, mensaje) {
  const valor = (mensaje?.valor || '').trim();

  if (!valor) {
    return {
      session,
      acciones: [{ tipo: 'texto', contenido: 'Necesito la marca para seguir. ¿Cuál es?' }],
    };
  }

  session.marca = valor;
  session.paso_actual = 'esperando_codigo_postal';
  return {
    session,
    acciones: [{ tipo: 'texto', contenido: 'Perfecto. ¿Cuál es tu *código postal*?' }],
  };
}

// HU-03 - RF-06, RF-08
function manejarCodigoPostal(session, mensaje) {
  const valor = (mensaje?.valor || '').trim();

  if (!REGEX_CODIGO_POSTAL.test(valor)) {
    return {
      session,
      acciones: [{ tipo: 'texto', contenido: 'El código postal tiene que ser numérico, de 4 dígitos. ¿Me lo pasás de nuevo?' }],
    };
  }

  session.codigo_postal = valor;
  session.paso_actual = 'esperando_aseguradora';
  return {
    session,
    acciones: [
      {
        tipo: 'lista',
        cuerpo: '¿Tenés alguna aseguradora en mente?',
        textoBoton: 'Ver opciones',
        filas: [
          ...config.aseguradoras.map((a) => ({ id: `aseg_${a.toLowerCase()}`, titulo: a })),
          { id: 'aseg_recomendar', titulo: 'No sé, recomendame', descripcion: 'Te muestro pros y contras de cada una' },
        ],
      },
    ],
  };
}

// HU-04 - RF-09, RF-10, RF-11
function manejarAseguradora(session, mensaje) {
  if (mensaje?.valor === 'aseg_recomendar') {
    const resumen = config.aseguradoras.map((a) => `*${a}*: ${PROS_Y_CONTRAS_ASEGURADORAS[a]}`).join('\n\n');
    // Se mantiene el mismo paso - vuelve a preguntar después de mostrar el resumen (A1 de UC-04)
    return {
      session,
      acciones: [
        { tipo: 'texto', contenido: resumen },
        {
          tipo: 'lista',
          cuerpo: 'Con esto, ¿cuál elegís?',
          textoBoton: 'Ver opciones',
          filas: config.aseguradoras.map((a) => ({ id: `aseg_${a.toLowerCase()}`, titulo: a })),
        },
      ],
    };
  }

  const aseguradoraElegida = config.aseguradoras.find((a) => mensaje?.valor === `aseg_${a.toLowerCase()}`);

  // Si no eligió nada reconocible, se le asigna la de por defecto (RF-11) y se cierra igual
  session.aseguradora_preferida = aseguradoraElegida || config.aseguradoraPorDefecto;
  session.paso_actual = 'completado';
  session.estado_conversacion = 'completada';

  return {
    session,
    acciones: [
      {
        tipo: 'texto',
        contenido:
          '¡Listo! 🎉 Ya tengo todos tus datos. Germán o Sandra te van a contactar a la brevedad con la cotización.',
      },
    ],
    listoParaGuardar: true,
  };
}

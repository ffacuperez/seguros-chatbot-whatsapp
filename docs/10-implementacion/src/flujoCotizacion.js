import { config } from './config.js';

// Formato esperado de patente argentina: viejo (ABC123) o mercosur (AB123CD) - RF-07
const REGEX_PATENTE = /^[A-Z]{3}\d{3}$|^[A-Z]{2}\d{3}[A-Z]{2}$/i;
const REGEX_CODIGO_POSTAL = /^\d{4}$/; // RF-08

/**
 * Características de cada aseguradora, según lo que pasó Germán (14:32-14:37, 09/08/2026).
 * Estructurado por categoría en vez de texto libre, para poder generar el mensaje
 * mostrando solo las categorías con dato real (sin "N/A" feos).
 */
const CARACTERISTICAS_ASEGURADORAS = {
  Mapfre: {
    velocidadRespuesta: 'Excelente capacidad de respuesta, rápida en indemnización y plazos',
    vehiculosQueAcepta: 'Compañía premium: no toma cualquier vehículo',
  },
  Rivadavia: {
    velocidadRespuesta: 'Buena capacidad de respuesta',
    variedadCoberturas: 'Muchas opciones de cobertura',
    fortalezaPorTipo: 'Más alternativas en autos que en motos',
  },
  Triunfo: {
    velocidadRespuesta: 'Más lenta (el trámite tarda más, no significa que no pague)',
    vehiculosQueAcepta: 'Acepta autos de modelos más viejos',
    fortalezaPorTipo: 'Muy buen precio en motos',
  },
  Digna: {
    variedadCoberturas: 'Variantes de cobertura bastante completas, a buen precio',
    requisitosEspeciales: 'Exige instalar un sistema de rastreo en el vehículo',
  },
};

const ETIQUETAS_CATEGORIA = {
  velocidadRespuesta: '⚡ Velocidad de respuesta',
  vehiculosQueAcepta: '🚗 Vehículos que acepta',
  variedadCoberturas: '📋 Variedad de coberturas',
  requisitosEspeciales: '📡 Requisitos especiales',
  fortalezaPorTipo: '🏍️ Fortaleza por tipo de vehículo',
};

/**
 * Arma el texto de una aseguradora mostrando solo las categorías con dato real.
 */
function generarResumenAseguradora(nombre) {
  const caracteristicas = CARACTERISTICAS_ASEGURADORAS[nombre] || {};
  const lineas = Object.entries(caracteristicas).map(
    ([categoria, texto]) => `${ETIQUETAS_CATEGORIA[categoria]}: ${texto}`
  );
  return `*${nombre}*\n${lineas.join('\n')}`;
}

/**
 * Distancia de Levenshtein simple, para tolerar typos como "Rivadadia" -> "Rivadavia" (BUG-06).
 */
function distanciaLevenshtein(a, b) {
  const filas = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  filas[0] = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      filas[i][j] =
        a[i - 1] === b[j - 1]
          ? filas[i - 1][j - 1]
          : 1 + Math.min(filas[i - 1][j - 1], filas[i - 1][j], filas[i][j - 1]);
    }
  }
  return filas[a.length][b.length];
}

function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Busca la aseguradora más parecida al texto libre que escribió el cliente.
 * Devuelve null si ninguna se parece lo suficiente (evita adivinar mal).
 */
function encontrarAseguradoraPorTexto(texto) {
  const normalizado = normalizar(texto);
  let mejor = null;
  let mejorDistancia = Infinity;

  for (const aseguradora of config.aseguradoras) {
    const distancia = distanciaLevenshtein(normalizado, normalizar(aseguradora));
    if (distancia < mejorDistancia) {
      mejorDistancia = distancia;
      mejor = aseguradora;
    }
  }

  // Tolera hasta 2 caracteres de diferencia (typos comunes), no más
  return mejorDistancia <= 2 ? mejor : null;
}

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

    case 'derivado_manual':
      return manejarNombreManual(session, mensajeEntrante);

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
    // A1 de UC-02: se deriva a contacto manual - pasa a esperar el nombre, no cierra todavía
    session.paso_actual = 'derivado_manual';
    return {
      session,
      acciones: [
        {
          tipo: 'texto',
          contenido:
            'Por el momento ese tipo de seguro lo gestionamos directo con vos 🙂. Dejame tu nombre y te contactamos a la brevedad.',
        },
      ],
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
    const resumen = config.aseguradoras.map((a) => generarResumenAseguradora(a)).join('\n\n');
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

  const aseguradoraElegida =
    mensaje?.tipo === 'texto'
      ? encontrarAseguradoraPorTexto(mensaje.valor || '')
      : config.aseguradoras.find((a) => mensaje?.valor === `aseg_${a.toLowerCase()}`);

  // BUG-06: antes acá se caía directo al default (Triunfo) ante cualquier texto no reconocido.
  // Ahora, si no se reconoce nada, se vuelve a preguntar en vez de asumir - RF-11 solo aplica
  // cuando de verdad no hay respuesta (ver 09-modelo-de-datos y el job de HU-06/RF-15).
  if (!aseguradoraElegida) {
    return {
      session,
      acciones: [
        {
          tipo: 'lista',
          cuerpo: 'No reconocí esa aseguradora. Elegí una de la lista, o tocá "No sé, recomendame":',
          textoBoton: 'Ver opciones',
          filas: [
            ...config.aseguradoras.map((a) => ({ id: `aseg_${a.toLowerCase()}`, titulo: a })),
            { id: 'aseg_recomendar', titulo: 'No sé, recomendame', descripcion: 'Te muestro pros y contras de cada una' },
          ],
        },
      ],
    };
  }

  session.aseguradora_preferida = aseguradoraElegida;
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

// A1 de UC-02 (continuación) - captura el nombre para la derivación manual (Hogar, Comercio, General)
function manejarNombreManual(session, mensaje) {
  const valor = (mensaje?.valor || '').trim();

  if (!valor) {
    return {
      session,
      acciones: [{ tipo: 'texto', contenido: 'Necesito tu nombre para que te puedan contactar. ¿Cómo te llamás?' }],
    };
  }

  session.nombre = valor;
  session.tipo_seguro = session.tipo_seguro || 'Otro (a definir)';
  session.paso_actual = 'completado';
  session.estado_conversacion = 'completada';

  return {
    session,
    acciones: [{ tipo: 'texto', contenido: '¡Gracias! Ya avisamos a Germán/Sandra para que te contacten.' }],
    listoParaGuardar: true,
  };
}
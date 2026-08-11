import { getSession, crearSessionInicial, guardarSession } from '../state/redisClient.js';
import { procesarPaso } from '../flujoCotizacion.js';
import { enviarTexto, enviarBotones, enviarLista } from '../integrations/whatsapp.js';
import { guardarLead } from './leadsService.js';
import { notificarNuevoLead } from './notificationService.js';

/**
 * Punto de entrada único para cualquier mensaje entrante.
 * Corresponde al componente ServicioConversacion del diagrama de 08-arquitectura:
 * usa FlujoCotización para decidir qué hacer, Sesión (Redis) para persistir el avance,
 * y delega en ServicioLeads / ServicioNotificaciones al cerrar el flujo.
 */
export async function manejarMensajeEntrante(mensaje) {
  const { from: telefono, nombrePerfil } = mensaje;

  let session = await getSession(telefono);

  // UC-07: si no hay sesión (nunca escribió, o la sesión expiró/fue completada), arranca de cero
  if (!session || session.estado_conversacion !== 'activa') {
    session = crearSessionInicial(telefono);
  }

  // El nombre del perfil de WhatsApp se captura automáticamente, sin preguntarle al cliente
  if (nombrePerfil && !session.nombre) {
    session.nombre = nombrePerfil;
  }

  const { session: sessionActualizada, acciones, listoParaGuardar } = procesarPaso(session, mensaje);

  await guardarSession(telefono, sessionActualizada);

  await enviarAcciones(telefono, acciones);

  // HU-05: al completar el flujo, se guarda el lead y se notifica a Sandra
  if (listoParaGuardar) {
    const lead = await guardarLead(sessionActualizada);
    await notificarNuevoLead(lead);
  }
}

async function enviarAcciones(telefono, acciones) {
  for (const accion of acciones) {
    if (accion.tipo === 'texto') {
      await enviarTexto(telefono, accion.contenido);
    } else if (accion.tipo === 'botones') {
      await enviarBotones(telefono, accion.cuerpo, accion.botones);
    } else if (accion.tipo === 'lista') {
      await enviarLista(telefono, accion.cuerpo, accion.textoBoton, accion.filas);
    }
  }
}
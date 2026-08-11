import axios from 'axios';
import { config } from '../config.js';

const baseUrl = () =>
  `https://graph.facebook.com/${config.whatsapp.apiVersion}/${config.whatsapp.phoneNumberId}/messages`;

const headers = () => ({
  Authorization: `Bearer ${config.whatsapp.token}`,
  'Content-Type': 'application/json',
});

/**
 * Envía un mensaje de texto simple.
 */
export async function enviarTexto(to, body) {
  return axios.post(
    baseUrl(),
    {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    },
    { headers: headers() }
  );
}

/**
 * Envía un mensaje interactivo con botones (hasta 3 opciones).
 * Usado en HU-02 (tipo de seguro, si son pocas opciones) y confirmaciones simples.
 */
export async function enviarBotones(to, textoCuerpo, botones) {
  return axios.post(
    baseUrl(),
    {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: textoCuerpo },
        action: {
          buttons: botones.map((b) => ({
            type: 'reply',
            reply: { id: b.id, title: b.titulo },
          })),
        },
      },
    },
    { headers: headers() }
  );
}

/**
 * Envía un mensaje interactivo tipo lista (más de 3 opciones).
 * Usado en HU-04 (aseguradora preferida).
 */
export async function enviarLista(to, textoCuerpo, textoBoton, filas) {
  return axios.post(
    baseUrl(),
    {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        body: { text: textoCuerpo },
        action: {
          button: textoBoton,
          sections: [{ title: 'Opciones', rows: filas.map((f) => ({ id: f.id, title: f.titulo, description: f.descripcion })) }],
        },
      },
    },
    { headers: headers() }
  );
}

/**
 * Envía un mensaje de plantilla pre-aprobada - usado para notificar a Sandra (RF-18/RNF-07),
 * ya que es un mensaje iniciado por el negocio y no por el cliente.
 */
export async function enviarPlantilla(to, nombrePlantilla, parametros) {
  return axios.post(
    baseUrl(),
    {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: nombrePlantilla,
        language: { code: 'es_AR' },
        components: [
          {
            type: 'body',
            parameters: parametros.map((texto) => ({ type: 'text', text: texto })),
          },
        ],
      },
    },
    { headers: headers() }
  );
}

/**
 * Valida el webhook de Meta al momento de configurarlo (GET /webhook).
 */
export function verificarWebhook(query) {
  const mode = query['hub.mode'];
  const token = query['hub.verify_token'];
  const challenge = query['hub.challenge'];

  if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
    return challenge;
  }
  return null;
}

/**
 * Extrae el mensaje entrante de un payload de webhook de Meta,
 * normalizando tanto texto libre como respuestas de botones/listas.
 */
export function extraerMensajeEntrante(body) {
  const entry = body?.entry?.[0];
  const change = entry?.changes?.[0];
  const mensaje = change?.value?.messages?.[0];
  if (!mensaje) return null;

  const from = mensaje.from;
  const id = mensaje.id;

  // El nombre del perfil de WhatsApp viene gratis en el payload — no hace falta pedirlo
  const nombrePerfil = change?.value?.contacts?.[0]?.profile?.name || null;

  if (mensaje.type === 'text') {
    return { from, id, nombrePerfil, tipo: 'texto', valor: mensaje.text.body.trim() };
  }

  if (mensaje.type === 'interactive') {
    const interactive = mensaje.interactive;
    if (interactive.type === 'button_reply') {
      return { from, id, nombrePerfil, tipo: 'seleccion', valor: interactive.button_reply.id };
    }
    if (interactive.type === 'list_reply') {
      return { from, id, nombrePerfil, tipo: 'seleccion', valor: interactive.list_reply.id };
    }
  }

  return { from, id, nombrePerfil, tipo: 'no_soportado', valor: null };
}
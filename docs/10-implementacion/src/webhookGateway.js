import { Router } from 'express';
import { verificarWebhook, extraerMensajeEntrante } from './integrations/whatsapp.js';
import { manejarMensajeEntrante } from './services/conversationService.js';
import { marcarMensajeComoNuevo } from './state/redisClient.js';

const router = Router();

/**
 * Meta llama a este endpoint una sola vez, al configurar el webhook en el panel de desarrolladores.
 */
router.get('/webhook', (req, res) => {
  const challenge = verificarWebhook(req.query);
  if (challenge) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

/**
 * Meta llama a este endpoint cada vez que llega un mensaje real del cliente.
 */
router.post('/webhook', async (req, res) => {
  // Se responde 200 inmediatamente - Meta espera una respuesta rápida y reintenta si no la recibe
  res.sendStatus(200);

  try {
    const mensaje = extraerMensajeEntrante(req.body);
    if (!mensaje || mensaje.tipo === 'no_soportado') return;

    // BUG-05: descarta reintentos del mismo mensaje (típico durante el cold start de Render)
    const esNuevo = await marcarMensajeComoNuevo(mensaje.id);
    if (!esNuevo) {
      console.log(`Mensaje duplicado ignorado: ${mensaje.id}`);
      return;
    }

    await manejarMensajeEntrante(mensaje);
  } catch (error) {
    console.error('Error procesando mensaje entrante:', error);
  }
});

export default router;
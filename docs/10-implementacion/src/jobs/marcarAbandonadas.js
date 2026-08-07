import cron from 'node-cron';
import { listarSesionesActivas, guardarSession } from '../state/redisClient.js';
import { config } from '../config.js';

/**
 * HU-06 / RF-15: marca como "abandonada" toda sesión activa sin interacción
 * hace más de config.abandonoUmbralHoras. No reenvía mensajes automáticos (evita spam).
 * Corre una vez por hora.
 */
export function iniciarJobMarcarAbandonadas() {
  cron.schedule('0 * * * *', async () => {
    const sesiones = await listarSesionesActivas();
    const ahora = Date.now();
    const umbralMs = config.abandonoUmbralHoras * 60 * 60 * 1000;

    for (const session of sesiones) {
      if (session.estado_conversacion !== 'activa') continue;

      const ultimaInteraccion = new Date(session.fecha_ultima_interaccion).getTime();
      if (ahora - ultimaInteraccion > umbralMs) {
        session.estado_conversacion = 'abandonada';
        await guardarSession(session.telefono, session);
        console.log(`Sesión marcada como abandonada: ${session.telefono}`);
      }
    }
  });
}

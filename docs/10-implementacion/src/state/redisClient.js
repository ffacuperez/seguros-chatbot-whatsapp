import Redis from 'ioredis';
import { config } from '../config.js';

const redis = new Redis(config.redis.url);

const sessionKey = (telefono) => `session:${telefono}`;

/**
 * Devuelve la sesión activa de un teléfono, o null si no existe todavía.
 * Corresponde a "Sesión" dentro de ServicioConversacion en el diagrama de componentes.
 */
export async function getSession(telefono) {
  const raw = await redis.get(sessionKey(telefono));
  return raw ? JSON.parse(raw) : null;
}

/**
 * Crea una sesión nueva en el paso inicial - ver 09-modelo-de-datos.
 */
export function crearSessionInicial(telefono) {
  const ahora = new Date().toISOString();
  return {
    telefono,
    paso_actual: 'bienvenida',
    tipo_seguro: null,
    nombre: null,
    patente: null,
    marca: null,
    codigo_postal: null,
    aseguradora_preferida: null,
    fecha_inicio: ahora,
    fecha_ultima_interaccion: ahora,
    estado_conversacion: 'activa',
  };
}

/**
 * Guarda (crea o actualiza) la sesión, refrescando el TTL y la fecha de última interacción.
 */
export async function guardarSession(telefono, session) {
  session.fecha_ultima_interaccion = new Date().toISOString();
  await redis.set(sessionKey(telefono), JSON.stringify(session), 'EX', config.sessionTtlSeconds);
}

export async function eliminarSession(telefono) {
  await redis.del(sessionKey(telefono));
}

/**
 * Recorre todas las sesiones activas para detectar abandono - HU-06 / RF-15.
 * Usado por el job programado en src/jobs/marcarAbandonadas.js
 */
export async function listarSesionesActivas() {
  const keys = await redis.keys('session:*');
  if (keys.length === 0) return [];

  const valores = await redis.mget(keys);
  return valores.filter(Boolean).map((v) => JSON.parse(v));
}

export default redis;

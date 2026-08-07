import { agregarFila } from '../integrations/googleSheets.js';

/**
 * Transforma la sesión de Redis al formato de fila de Sheets y la persiste.
 * Ver 09-modelo-de-datos, sección "Relación entre ambas estructuras".
 */
export async function guardarLead(session) {
  const lead = {
    fechaHora: new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Cordoba' }),
    nombre: session.nombre || '(no informado)',
    telefono: session.telefono,
    tipoSeguro: session.tipo_seguro,
    patente: session.patente,
    marca: session.marca,
    codigoPostal: session.codigo_postal,
    aseguradoraPreferida: session.aseguradora_preferida,
  };

  await agregarFila(lead);
  return lead;
}

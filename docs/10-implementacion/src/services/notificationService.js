import { enviarPlantilla } from '../integrations/whatsapp.js';
import { config } from '../config.js';

/**
 * Notifica a Sandra de un nuevo lead usando la plantilla pre-aprobada - RF-18, RNF-07.
 * Si falla, no reintenta ni bloquea: el dato ya está guardado en Sheets (RF-19).
 */
export async function notificarNuevoLead(lead) {
  try {
    await enviarPlantilla(config.sandra.whatsappNumber, config.whatsapp.notificationTemplate, [
      lead.nombre,
      lead.tipoSeguro,
      lead.aseguradoraPreferida,
    ]);
  } catch (error) {
     console.error('No se pudo notificar a Sandra:', JSON.stringify(error.response?.data, null, 2));
  }
}

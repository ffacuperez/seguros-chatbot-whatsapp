import { google } from 'googleapis';
import { config } from '../config.js';

const RANGO_HOJA = 'Leads!A:I'; // 9 columnas - ver 09-modelo-de-datos

async function getSheetsClient() {
  const auth = new google.auth.JWT(
    config.googleSheets.serviceAccountEmail,
    null,
    config.googleSheets.privateKey,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  await auth.authorize();
  return google.sheets({ version: 'v4', auth });
}

/**
 * Agrega una fila nueva a la planilla de leads.
 * El orden de columnas debe coincidir EXACTO con 09-modelo-de-datos.
 */
export async function agregarFila(lead) {
  const sheets = await getSheetsClient();

  const fila = [
    lead.fechaHora,
    lead.nombre,
    lead.telefono,
    lead.tipoSeguro,
    lead.patente,
    lead.marca,
    lead.codigoPostal,
    lead.aseguradoraPreferida,
    'Pendiente', // columna Estado - siempre arranca así (uso manual de Sandra)
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: config.googleSheets.sheetId,
    range: RANGO_HOJA,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [fila] },
  });
}

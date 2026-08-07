import 'dotenv/config';

export const config = {
  whatsapp: {
    token: process.env.WHATSAPP_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v20.0',
    notificationTemplate: process.env.WHATSAPP_NOTIFICATION_TEMPLATE,
  },
  sandra: {
    whatsappNumber: process.env.SANDRA_WHATSAPP_NUMBER,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  googleSheets: {
    sheetId: process.env.GOOGLE_SHEETS_ID,
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    // Reemplaza los \n literales que suelen venir escapados en variables de entorno
    privateKey: (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },
  port: process.env.PORT || 3000,

  // TTL de la sesión en Redis - ver 09-modelo-de-datos
  sessionTtlSeconds: 60 * 60 * 48, // 48hs

  // Umbral para marcar una conversación como abandonada - HU-06 / RF-15
  abandonoUmbralHoras: 24,

  // Aseguradoras disponibles - RF-09
  aseguradoras: ['Rivadavia', 'Mapfre', 'Digna', 'Triunfo'],
  aseguradoraPorDefecto: 'Triunfo',
};

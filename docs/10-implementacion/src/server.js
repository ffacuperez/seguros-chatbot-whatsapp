import express from 'express';
import { config } from './config.js';
import webhookGateway from './webhookGateway.js';
import { iniciarJobMarcarAbandonadas } from './jobs/marcarAbandonadas.js';

const app = express();
app.use(express.json());

app.use('/', webhookGateway);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(config.port, () => {
  console.log(`Servidor escuchando en el puerto ${config.port}`);
  iniciarJobMarcarAbandonadas();
});

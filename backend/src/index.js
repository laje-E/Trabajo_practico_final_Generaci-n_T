require('dotenv/config');
const express = require('express');
const cors = require('cors');
const prisma = require('./lib/prisma');

const app = express();

// Middlewares
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Health check (útil para Render)
app.get('/', (req, res) => {
  res.json({ ok: true, servicio: 'Club Atlético Villa Norte - API' });
});

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: 'conectada' });
  } catch (error) {
    console.error('Error de base de datos:', error);
    res.status(500).json({ ok: false, db: 'sin conexión' });
  }
});

// ---- Acá van tus rutas ----
// Ejemplo:
// app.use('/api/canchas', require('./routes/canchas'));
app.use('/api/reservas', require('./routes/reservas'));

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Arranque
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Cierre ordenado
async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
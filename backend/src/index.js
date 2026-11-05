const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importación de enrutadores
const reservaRoutes = require('./routes/reservaRoutes');
const listaEsperaRoutes = require('./routes/listaEsperaRoutes');
const penalizacionRoutes = require('./routes/penalizacionRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// ==========================================
// REGISTRO DE RUTAS DE LA API
// ==========================================
app.use('/api/reservas', reservaRoutes);
app.use('/api/espera', listaEsperaRoutes);
app.use('/api/penalizaciones', penalizacionRoutes);
app.use('/api/admin', adminRoutes);

// Endpoint de verificación de estado (Health Check)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Backend del Club Atlético Villa Norte funcionando correctamente desde internet',
    timestamp: new Date()
  });
});

// Inicialización del servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
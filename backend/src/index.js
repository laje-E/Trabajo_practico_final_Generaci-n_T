const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importación de enrutadores de los módulos anteriores
const reservaRoutes = require('./routes/reservaRoutes');
const listaEsperaRoutes = require('./routes/listaEsperaRoutes');
const penalizacionRoutes = require('./routes/penalizacionRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// ==========================================
// REGISTRO DE RUTAS DE LA API
// ==========================================

// Rutas de reservas, precios variables y concurrencia (Commit 4 y 5)
app.use('/api/reservas', reservaRoutes);

// Rutas de lista de espera automatizada y límite de 30 minutos (Commit 6)
app.use('/api/espera', listaEsperaRoutes);

// Rutas de cancelaciones, penalizaciones y faltas (Commit 7)
app.use('/api/penalizaciones', penalizacionRoutes);

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
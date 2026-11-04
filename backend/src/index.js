const express = require('express');
const cors = require('cors');
require('dotenv').config();

const reservaRoutes = require('./routes/reservaRoutes');
const listaEsperaRoutes = require('./routes/listaEsperaRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/reservas', reservaRoutes);
app.use('/api/espera', listaEsperaRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Backend del Club Atlético Villa Norte funcionando correctamente desde internet',
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Endpoint de verificación de estado para Render / Monitoreo
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
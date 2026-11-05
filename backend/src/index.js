const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configuración de CORS
app.use(cors({
    origin: 'https://tpgeneraciont.netlify.app'
}));

// Permite recibir datos en formato JSON
app.use(express.json());

// Importar rutas
const reservasRoutes = require('./routes/reservas');

// Registrar rutas
app.use('/api/reservas', reservasRoutes);

// Ruta de prueba para comprobar que el servidor funciona
app.get('/', (req, res) => {
    res.json({
        mensaje: 'Backend funcionando correctamente'
    });
});

// Puerto del servidor
const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});
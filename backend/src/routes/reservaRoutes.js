const express = require('express');

const router = express.Router();

// POST /api/reservas
// Crear una nueva reserva
router.post('/', async (req, res) => {
    try {
        const { usuarioId, canchaId, fechaInicio } = req.body;

        console.log('Datos recibidos para crear una reserva:', req.body);

        // Validar que se hayan recibido los datos necesarios
        if (!usuarioId || !canchaId || !fechaInicio) {
            return res.status(400).json({
                error: 'Faltan datos para crear la reserva'
            });
        }

        // Validar que la fecha sea correcta
        const fecha = new Date(fechaInicio);

        if (isNaN(fecha.getTime())) {
            return res.status(400).json({
                error: 'La fecha de inicio no es válida'
            });
        }

        /*
         * IMPORTANTE:
         * Acá debe ir la lógica que guarda la reserva
         * en la base de datos utilizando Prisma.
         *
         * Todavía no estamos creando el registro en la DB.
         */

        return res.status(201).json({
            mensaje: 'Solicitud de reserva recibida correctamente',
            reserva: {
                usuarioId,
                canchaId,
                fechaInicio: fecha.toISOString()
            }
        });

    } catch (error) {
        console.error('Error al crear la reserva:', error);

        return res.status(500).json({
            error: 'Error interno al crear la reserva'
        });
    }
});

module.exports = router;
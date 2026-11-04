const express = require('express');
const router = express.Router();
const penalizacionController = require('../controllers/penalizacionController');

router.patch('/cancelar/:reservaId', penalizacionController.cancelarReserva);
router.post('/falta', penalizacionController.registrarFalta);

module.exports = router;
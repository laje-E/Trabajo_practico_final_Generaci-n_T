const express = require('express');
const router = express.Router();
const listaEsperaController = require('../controllers/listaEsperaController');

router.post('/', listaEsperaController.anotarseListaEspera);
router.post('/liberar', listaEsperaController.procesarLiberacionTurno);

module.exports = router;
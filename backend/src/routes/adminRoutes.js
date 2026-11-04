const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/mantenimiento', adminController.bloquearCanchaMantenimiento);

module.exports = router;
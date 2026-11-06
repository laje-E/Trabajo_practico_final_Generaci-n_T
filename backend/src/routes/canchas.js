const express = require('express');
const prisma = require('../lib/prisma');
const { rangoDiaLocal } = require('../lib/reglas');

const router = express.Router();

const DEPORTES_VALIDOS = ['FUTBOL5', 'PADEL', 'TENIS'];

// GET /api/canchas            -> todas las canchas
// GET /api/canchas?deporte=PADEL -> filtradas por deporte
router.get('/', async (req, res, next) => {
  try {
    const where = {};
    if (req.query.deporte) {
      const deporte = String(req.query.deporte).toUpperCase();
      if (!DEPORTES_VALIDOS.includes(deporte)) {
        return res.status(400).json({ error: `deporte inválido. Opciones: ${DEPORTES_VALIDOS.join(', ')}` });
      }
      where.deporte = deporte;
    }
    const canchas = await prisma.cancha.findMany({ where, orderBy: { id: 'asc' } });
    res.json(canchas);
  } catch (err) {
    next(err);
  }
});

// GET /api/canchas/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'id de cancha inválido' });
    }
    const cancha = await prisma.cancha.findUnique({ where: { id } });
    if (!cancha) return res.status(404).json({ error: 'Cancha no encontrada' });
    res.json(cancha);
  } catch (err) {
    next(err);
  }
});

// GET /api/canchas/:id/disponibilidad?fecha=2026-11-10
// Devuelve los turnos ocupados de ese día (horario argentino).
router.get('/:id/disponibilidad', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'id de cancha inválido' });
    }
    const rango = rangoDiaLocal(String(req.query.fecha || ''));
    if (!rango) {
      return res.status(400).json({ error: 'Indicá la fecha con formato AAAA-MM-DD (?fecha=2026-11-10)' });
    }
    const cancha = await prisma.cancha.findUnique({ where: { id } });
    if (!cancha) return res.status(404).json({ error: 'Cancha no encontrada' });

    const ocupados = await prisma.reserva.findMany({
      where: {
        canchaId: id,
        estado: 'ACTIVA',
        fechaInicio: { lt: rango.hasta },
        fechaFin: { gt: rango.desde },
      },
      select: { fechaInicio: true, fechaFin: true },
      orderBy: { fechaInicio: 'asc' },
    });

    res.json({ cancha, fecha: req.query.fecha, ocupados });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const express = require('express');
const prisma = require('../lib/prisma');
const {
  DEPORTES,
  ReglaError,
  dentroDeHorario,
  calcularPrecio,
  limitesUsuario,
  calcularPenalizacion,
  MS_DIA,
} = require('../lib/reglas');

const router = express.Router();

function enteroPositivo(valor) {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// POST /api/reservas
// Body: { usuarioId, canchaId, fechaInicio }  (fechaInicio en formato ISO)
router.post('/', async (req, res, next) => {
  try {
    const usuarioId = enteroPositivo(req.body.usuarioId);
    const canchaId = enteroPositivo(req.body.canchaId);
    if (!usuarioId) throw new ReglaError('usuarioId debe ser un número entero válido');
    if (!canchaId) throw new ReglaError('canchaId debe ser un número entero válido');

    if (typeof req.body.fechaInicio !== 'string') {
      throw new ReglaError('fechaInicio es obligatoria');
    }
    const inicio = new Date(req.body.fechaInicio);
    if (Number.isNaN(inicio.getTime())) throw new ReglaError('fechaInicio no es una fecha válida');

    // REGLA-5.1: transacción Serializable. Si dos pedidos chocan por la misma
    // cancha y horario, Postgres hace fallar a uno de los dos.
    const reserva = await prisma.$transaction(
      async (tx) => {
        const usuario = await tx.usuario.findUnique({ where: { id: usuarioId } });
        if (!usuario) throw new ReglaError('Usuario no encontrado', 404);

        const cancha = await tx.cancha.findUnique({ where: { id: canchaId } });
        if (!cancha) throw new ReglaError('Cancha no encontrada', 404);
        if (!cancha.activa) throw new ReglaError('La cancha está en mantenimiento', 409);

        const ahora = new Date();

        // REGLA-7.3: usuario bloqueado por faltas
        if (usuario.bloqueadoHasta && usuario.bloqueadoHasta > ahora) {
          throw new ReglaError(
            `Usuario bloqueado para reservar hasta ${usuario.bloqueadoHasta.toISOString()}`,
            403
          );
        }

        // REGLA-2.1 / 2.2: duración fija por deporte
        const duracionMin = DEPORTES[cancha.deporte].duracionMin;
        const fin = new Date(inicio.getTime() + duracionMin * 60 * 1000);

        // REGLA-1.2: horario del club
        if (!dentroDeHorario(inicio, duracionMin)) {
          throw new ReglaError(
            `El turno de ${cancha.deporte} (${duracionMin} min) debe estar entre las 8:00 y las 24:00`
          );
        }

        // REGLA-3.1: anticipación máxima
        if (inicio <= ahora) throw new ReglaError('El turno debe ser a futuro');
        const { diasMax, activasMax } = limitesUsuario(usuario.esSocio);
        if (inicio.getTime() - ahora.getTime() > diasMax * MS_DIA) {
          throw new ReglaError(
            `${usuario.esSocio ? 'Los socios' : 'Los no socios'} pueden reservar hasta ${diasMax} días de anticipación`
          );
        }

        // REGLA-3.2: reservas activas simultáneas
        const activas = await tx.reserva.count({
          where: { usuarioId, estado: 'ACTIVA', fechaFin: { gt: ahora } },
        });
        if (activas >= activasMax) {
          throw new ReglaError(
            `Alcanzaste el máximo de ${activasMax} reserva(s) activa(s) para tu categoría`,
            409
          );
        }

        // Turno ya ocupado (superposición con otra reserva activa)
        const choque = await tx.reserva.findFirst({
          where: {
            canchaId,
            estado: 'ACTIVA',
            fechaInicio: { lt: fin },
            fechaFin: { gt: inicio },
          },
        });
        if (choque) throw new ReglaError('Ese turno ya está reservado', 409);

        // REGLA-4: precio
        const precio = calcularPrecio(cancha.deporte, usuario.esSocio, inicio);

        return tx.reserva.create({
          data: { usuarioId, canchaId, fechaInicio: inicio, fechaFin: fin, precio },
          include: { cancha: true },
        });
      },
      { isolationLevel: 'Serializable' }
    );

    res.status(201).json(reserva);
  } catch (err) {
    if (err instanceof ReglaError) return res.status(err.status).json({ error: err.message });
    // P2034: conflicto de escritura entre transacciones simultáneas
    if (err.code === 'P2034') {
      return res.status(409).json({ error: 'Otro usuario reservó ese turno al mismo tiempo. Probá de nuevo.' });
    }
    next(err);
  }
});

// GET /api/reservas?usuarioId=1   -> reservas de un usuario (opcional)
router.get('/', async (req, res, next) => {
  try {
    const where = {};
    if (req.query.usuarioId !== undefined) {
      const usuarioId = enteroPositivo(req.query.usuarioId);
      if (!usuarioId) return res.status(400).json({ error: 'usuarioId inválido' });
      where.usuarioId = usuarioId;
    }
    const reservas = await prisma.reserva.findMany({
      where,
      include: { cancha: true },
      orderBy: { fechaInicio: 'asc' },
    });
    res.json(reservas);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/reservas/:id/cancelar
// REGLA-7.1 / 7.2: sin cargo con más de 24 hs; 50% del valor si es menos.
router.patch('/:id/cancelar', async (req, res, next) => {
  try {
    const id = enteroPositivo(req.params.id);
    if (!id) return res.status(400).json({ error: 'id de reserva inválido' });

    const reserva = await prisma.reserva.findUnique({ where: { id } });
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });
    if (reserva.estado !== 'ACTIVA') {
      return res.status(409).json({ error: `La reserva ya está ${reserva.estado}` });
    }

    const ahora = new Date();
    if (reserva.fechaInicio <= ahora) {
      return res.status(400).json({ error: 'No se puede cancelar un turno que ya comenzó' });
    }

    const penalizacion = calcularPenalizacion(reserva.precio, reserva.fechaInicio, ahora);
    const actualizada = await prisma.reserva.update({
      where: { id },
      data: { estado: 'CANCELADA', penalizacion, canceladaEn: ahora },
    });

    res.json({
      reserva: actualizada,
      mensaje: penalizacion > 0
        ? `Cancelación tardía: se aplica un cargo de $${penalizacion}`
        : 'Cancelación sin cargo',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

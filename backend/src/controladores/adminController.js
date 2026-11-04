const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Bloquear cancha por mantenimiento y gestionar reservas activas afectas (REGLA-8.1)
exports.bloquearCanchaMantenimiento = async (req, res) => {
  try {
    const { canchaId, fechaInicio, fechaFin } = req.body;
    const inicioMantenimiento = new Date(fechaInicio);
    const finMantenimiento = new Date(fechaFin);

    const cancha = await prisma.cancha.findUnique({ where: { id: canchaId } });
    if (!cancha) {
      return res.status(404).json({ error: 'Cancha no encontrada' });
    }

    // 1. Buscar reservas confirmadas que se superpongan con el período de mantenimiento
    const reservasAfectadas = await prisma.reserva.findMany({
      where: {
        canchaId,
        estado: 'CONFIRMADA',
        AND: [
          { fechaInicio: { lt: finMantenimiento } },
          { fechaFin: { gt: inicioMantenimiento } }
        ]
      },
      include: { usuario: true }
    });

    // 2. Ejecutar transacción para cancelar las reservas afectadas y marcar la cancha
    const resultado = await prisma.$transaction(async (tx) => {
      // Desactivar temporalmente la cancha o registrar el bloqueo
      await tx.cancha.update({
        where: { id: canchaId },
        data: { activa: false }
      });

      const cancelaciones = [];

      // REGLA-8.1: Notificar a los afectados y cancelar sin penalización
      for (const reserva of reservasAfectadas) {
        const reservaCancelada = await tx.reserva.update({
          where: { id: reserva.id },
          data: { estado: 'CANCELADA' }
        });

        cancelaciones.json = cancelaciones.push({
          reservaId: reserva.id,
          usuario: reserva.usuario.email,
          fechaTurno: reserva.fechaInicio,
          motivo: 'REGLA-8.1: Cancelación por mantenimiento programado sin penalización y con prioridad de reubicación.'
        });
      }

      return cancelaciones;
    });

    return res.status(200).json({
      mensaje: 'REGLA-8.1: Cancha bloqueada por mantenimiento con éxito.',
      canchaId,
      totalReservasCanceladas: reservasAfectadas.length,
      detallesAfectados: resultado
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
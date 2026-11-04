const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Cancelación de reservas (REGLA-7.1 y REGLA-7.2)
exports.cancelarReserva = async (req, res) => {
  try {
    const { reservaId } = req.params;

    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      include: { usuario: true }
    });

    if (!reserva || reserva.estado !== 'CONFIRMADA') {
      return res.status(404).json({ error: 'Reserva no encontrada o ya inactiva' });
    }

    const ahora = new Date();
    const inicioTurno = new Date(reserva.fechaInicio);
    const diferenciaHoras = (inicioTurno - ahora) / (1000 * 60 * 60);

    let mensaje = '';
    let penalizacionAplicada = 0;

    // REGLA-7.1: Más de 24 h antes -> Cancelación sin cargo
    if (diferenciaHoras >= 24) {
      mensaje = 'REGLA-7.1: Cancelación realizada con más de 24 horas de anticipación. Sin cargo.';
    } 
    // REGLA-7.2: Menos de 24 h antes -> Penalización del 50% del valor del turno
    else {
      penalizacionAplicada = reserva.precioTotal * 0.50;
      mensaje = `REGLA-7.2: Cancelación tardía (menos de 24h). Se cobra una penalización del 50% ($${penalizacionAplicada}).`;
    }

    // Actualizar estado de la reserva a CANCELADA
    const reservaCancelada = await prisma.reserva.update({
      where: { id: reservaId },
      data: { estado: 'CANCELADA' }
    });

    return res.status(200).json({
      mensaje,
      penalizacion: penalizacionAplicada,
      reserva: reservaCancelada
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Registrar falta por no presentarse (REGLA-7.3)
exports.registrarFalta = async (req, res) => {
  try {
    const { usuarioId } = req.body;

    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const nuevasFaltas = usuario.faltasAcumuladas + 1;
    let fechaBloqueo = usuario.bloqueadoHasta;
    let mensaje = `REGLA-7.3: Falta registrada. Acumula ${nuevasFaltas} falta(s).`;

    // REGLA-7.3: Con 3 faltas en 30 días, bloqueo automático por 15 días
    if (nuevasFaltas >= 3) {
      const ahora = new Date();
      fechaBloqueo = new Date(ahora.getTime() + 15 * 24 * 60 * 60000); // +15 días
      mensaje += ' ATENCIÓN: Ha alcanzado 3 faltas. El usuario ha sido bloqueado automáticamente por 15 días.';
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        faltasAcumuladas: nuevasFaltas,
        bloqueadoHasta: fechaBloqueo
      }
    });

    return res.status(200).json({
      mensaje,
      usuario: usuarioActualizado
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
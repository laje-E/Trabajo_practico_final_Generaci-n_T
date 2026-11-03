const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// REGLA-2.1 y REGLA-2.2: Duración por deporte en minutos
const DURACION_DEPORTE = {
  FUTBOL_5: 60,
  PADEL: 90,
  TENIS: 90,
};

exports.crearReserva = async (req, res) => {
  try {
    const { usuarioId, canchaId, fechaInicio } = req.body;
    const inicio = new Date(fechaInicio);

    // 1. Obtener datos del usuario y de la cancha
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    const cancha = await prisma.cancha.findUnique({ where: { id: canchaId } });

    if (!usuario || !cancha) {
      return res.status(404).json({ error: 'Usuario o Cancha no encontrados' });
    }

    // REGLA-1.2: Validar horario general del club (8:00 a 24:00 hs)
    const horaInicio = inicio.getHours();
    if (horaInicio < 8 || horaInicio >= 24) {
      return res.status(400).json({ error: 'REGLA-1.2: El club solo opera de 08:00 a 24:00 hs.' });
    }

    // REGLA-3.1: Anticipación máxima (Socios: 7 días, No Socios: 3 días)
    const ahora = new Date();
    const diasDiferencia = (inicio - ahora) / (1000 * 60 * 60 * 24);
    const limiteDias = usuario.rol === 'SOCIO' ? 7 : 3;

    if (diasDiferencia > limiteDias || diasDiferencia < 0) {
      return res.status(400).json({
        error: `REGLA-3.1: Su categoría (${usuario.rol}) solo puede reservar con hasta ${limiteDias} días de anticipación.`
      });
    }

    // REGLA-3.2: Límite semanal de reservas activas (Socios: 2, No Socios: 1)
    const reservasActivas = await prisma.reserva.count({
      where: {
        usuarioId: usuario.id,
        estado: 'CONFIRMADA',
        fechaInicio: { gte: ahora }
      }
    });

    const maxReservasSemana = usuario.rol === 'SOCIO' ? 2 : 1;
    if (reservasActivas >= maxReservasSemana) {
      return res.status(400).json({
        error: `REGLA-3.2: Excedió el límite de ${maxReservasSemana} reserva(s) activa(s) permitida(s).`
      });
    }

    // Calcular fecha de fin según el deporte
    const duracionMinutos = DURACION_DEPORTE[cancha.deporte];
    const fin = new Date(inicio.getTime() + duracionMinutos * 60000);

    // Crear la reserva básica (el cálculo de precio y concurrencia se potenciará en el Commit 5)
    const reserva = await prisma.reserva.create({
      data: {
        usuarioId,
        canchaId,
        fechaInicio: inicio,
        fechaFin: fin,
        precioTotal: 0, // Se calculará dinámicamente
        estado: 'CONFIRMADA'
      }
    });

    return res.status(201).json({ mensaje: 'Reserva creada con éxito', reserva });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DURACION_DEPORTE = {
  FUTBOL_5: 60,
  PADEL: 90,
  TENIS: 90,
};

// Precios base por deporte (ejemplo en pesos)
const PRECIO_BASE = {
  FUTBOL_5: 20000,
  PADEL: 15000,
  TENIS: 12000,
};

exports.crearReserva = async (req, res) => {
  try {
    const { usuarioId, canchaId, fechaInicio } = req.body;
    const inicio = new Date(fechaInicio);

    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    const cancha = await prisma.cancha.findUnique({ where: { id: canchaId } });

    if (!usuario || !cancha) {
      return res.status(404).json({ error: 'Usuario o Cancha no encontrados' });
    }

    // REGLA-1.2: Validar horario general del club (8:00 a 24:00 hs)
    const horaInicio = inicio.getHours();
    if (horaInicio < 8 || horaInicio >= 24) {
      return res.status(400).json({ error: 'REGLA-1.2: El club opera de 08:00 a 24:00 hs.' });
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

    // REGLA-3.2: Límite semanal de reservas activas
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
        error: `REGLA-3.2: Excedió el límite de ${maxReservasSemana} reserva(s) activa(s).`
      });
    }

    const duracionMinutos = DURACION_DEPORTE[cancha.deporte];
    const fin = new Date(inicio.getTime() + duracionMinutos * 60000);

    // ==========================================
    // REGLA-4.1, 4.2 y 4.3: CÁLCULO DE PRECIOS VARIABLES
    // ==========================================
    let precio = PRECIO_BASE[cancha.deporte];

    // Descuento para socios: 20% antes del recargo pico
    if (usuario.rol === 'SOCIO') {
      precio = precio * 0.80; 
    }

    // Horario pico: 18 a 23 hs o fines de semana (Sábado = 6, Domingo = 0)
    const diaSemana = inicio.getDay();
    const esFinDeSemana = (diaSemana === 0 || diaSemana === 6);
    const esHoraPico = (horaInicio >= 18 && horaInicio < 23) || esFinDeSemana;

    if (esHoraPico) {
      precio = precio * 1.30; // 30% de recargo
    }

    // ==========================================
    // REGLA-5.1: CONTROL DE CONCURRENCIA (Doble Reserva)
    // Usamos una transacción serializada para garantizar que solo uno gane
    // ==========================================
    const resultadoReserva = await prisma.$transaction(async (tx) => {
      // Verificar si ya existe una reserva superpuesta para la misma cancha
      const colision = await tx.reserva.findFirst({
        where: {
          canchaId,
          estado: 'CONFIRMADA',
          AND: [
            { fechaInicio: { lt: fin } },
            { fechaFin: { gt: inicio } }
          ]
        }
      });

      if (colision) {
        throw new Error('REGLA-5.1: El turno seleccionado ya se encuentra ocupado por otro usuario (Doble reserva evitada).');
      }

      // Crear la reserva de forma segura
      return await tx.reserva.create({
        data: {
          usuarioId,
          canchaId,
          fechaInicio: inicio,
          fechaFin: fin,
          precioTotal: precio,
          estado: 'CONFIRMADA'
        }
      });
    });

    return res.status(201).json({ 
      mensaje: 'Reserva creada exitosamente', 
      precioFinal: resultadoReserva.precioTotal,
      reserva: resultadoReserva 
    });

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
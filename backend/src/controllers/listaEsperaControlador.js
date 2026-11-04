const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Anotarse a la lista de espera de un turno ocupado (REGLA-6.1)
exports.anotarseListaEspera = async (req, res) => {
  try {
    const { usuarioId, canchaId, fechaInicio, fechaFin } = req.body;
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    const cancha = await prisma.cancha.findUnique({ where: { id: canchaId } });

    if (!usuario || !cancha) {
      return res.status(404).json({ error: 'Usuario o Cancha no encontrados' });
    }

    // Verificar que el turno realmente esté ocupado
    const turnoOcupado = await prisma.reserva.findFirst({
      where: {
        canchaId,
        estado: 'CONFIRMADA',
        fechaInicio: inicio,
        fechaFin: fin
      }
    });

    if (!turnoOcupado) {
      return res.status(400).json({ error: 'El turno se encuentra libre. Puede realizar una reserva directa.' });
    }

    // Registrar en la lista de espera
    const entradaEspera = await prisma.listaEspera.create({
      data: {
        usuarioId,
        canchaId,
        fechaInicio: inicio,
        fechaFin: fin,
        atendido: false
      }
    });

    return res.status(201).json({
      mensaje: 'REGLA-6.1: Te has anotado exitosamente en la lista de espera para este turno.',
      entradaEspera
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Simular liberación de turno y activación del límite de 30 minutos (REGLA-6.2 y REGLA-6.3)
exports.procesarLiberacionTurno = async (req, res) => {
  try {
    const { canchaId, fechaInicio } = req.body;
    const inicio = new Date(fechaInicio);

    // Buscar al primer usuario en la lista de espera para este turno que no haya sido atendido
    const siguienteEnCola = await prisma.listaEspera.findFirst({
      where: {
        canchaId,
        fechaInicio: inicio,
        atendido: false,
        notificadoAt: null
      },
      orderBy: { createdAt: 'asc' },
      include: { usuario: true }
    });

    if (!siguienteEnCola) {
      return res.status(404).json({ mensaje: 'No hay usuarios en espera para este turno.' });
    }

    // REGLA-6.3: Establecer límite estricto de 30 minutos para confirmar
    const ahora = new Date();
    const expira = new Date(ahora.getTime() + 30 * 60000); // +30 minutos

    const actualizado = await prisma.listaEspera.update({
      where: { id: siguienteEnCola.id },
      data: {
        notificadoAt: ahora,
        expiraConfirmacion: expira
      }
    });

    return res.status(200).json({
      mensaje: 'REGLA-6.2 y 6.3: Turno liberado. Notificación enviada al primer usuario en cola.',
      usuarioNotificado: siguienteEnCola.usuario.email,
      limiteConfirmacion: expira
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
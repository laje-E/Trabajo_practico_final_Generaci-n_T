// Reglas de negocio del Club Atlético Villa Norte (ver spec.md).
// Todo el club opera en horario de Argentina (UTC-3, sin horario de verano).

const OFFSET_AR_MS = -3 * 60 * 60 * 1000;
const MS_HORA = 60 * 60 * 1000;
const MS_DIA = 24 * MS_HORA;

// REGLA-2.1 / 2.2: duración por deporte. Precios base en pesos (ajustalos a gusto).
const DEPORTES = {
  FUTBOL5: { duracionMin: 60, precioBase: 12000 },
  PADEL: { duracionMin: 90, precioBase: 9000 },
  TENIS: { duracionMin: 90, precioBase: 8000 },
};

// Error de regla de negocio: lleva el código HTTP que corresponde.
class ReglaError extends Error {
  constructor(mensaje, status = 400) {
    super(mensaje);
    this.name = 'ReglaError';
    this.status = status;
  }
}

// Devuelve día de semana (0=domingo), hora y minutos en horario argentino.
function partesLocales(fecha) {
  const local = new Date(fecha.getTime() + OFFSET_AR_MS);
  return {
    dia: local.getUTCDay(),
    horas: local.getUTCHours(),
    minutos: local.getUTCMinutes(),
  };
}

// REGLA-1.2: abierto de 8:00 a 24:00, todos los días.
function dentroDeHorario(inicio, duracionMin) {
  const { horas, minutos } = partesLocales(inicio);
  const minInicio = horas * 60 + minutos;
  return minInicio >= 8 * 60 && minInicio + duracionMin <= 24 * 60;
}

// REGLA-4.2: pico = 18:00 a 23:00 o fin de semana.
function esHorarioPico(inicio) {
  const { dia, horas } = partesLocales(inicio);
  const finDeSemana = dia === 0 || dia === 6;
  return finDeSemana || (horas >= 18 && horas < 23);
}

// REGLA-4.1 / 4.3: primero descuento de socio (20%), después recargo pico (30%).
function calcularPrecio(deporte, esSocio, inicio) {
  let precio = DEPORTES[deporte].precioBase;
  if (esSocio) precio *= 0.8;
  if (esHorarioPico(inicio)) precio *= 1.3;
  return Math.round(precio);
}

// REGLA-3.1 / 3.2
function limitesUsuario(esSocio) {
  return esSocio ? { diasMax: 7, activasMax: 2 } : { diasMax: 3, activasMax: 1 };
}

// REGLA-7.2: cargo del 50% si se cancela con menos de 24 hs de anticipación.
function calcularPenalizacion(precio, inicio, ahora = new Date()) {
  const anticipacion = inicio.getTime() - ahora.getTime();
  return anticipacion < MS_DIA ? Math.round(precio * 0.5) : 0;
}

// Rango UTC [desde, hasta) que cubre un día calendario argentino (YYYY-MM-DD).
function rangoDiaLocal(yyyyMmDd) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(yyyyMmDd)) return null;
  const desde = new Date(`${yyyyMmDd}T00:00:00-03:00`);
  if (Number.isNaN(desde.getTime())) return null;
  return { desde, hasta: new Date(desde.getTime() + MS_DIA) };
}

module.exports = {
  DEPORTES,
  MS_DIA,
  ReglaError,
  partesLocales,
  dentroDeHorario,
  esHorarioPico,
  calcularPrecio,
  limitesUsuario,
  calcularPenalizacion,
  rangoDiaLocal,
};

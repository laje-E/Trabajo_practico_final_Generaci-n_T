// Carga las 6 canchas del club (REGLA-1.1) y dos usuarios de prueba.
// Se puede correr las veces que quieras: no duplica datos.
// Uso: npm run seed   (necesita DATABASE_URL en el entorno o en backend/.env)
const prisma = require('./lib/prisma');

const canchas = [
  { nombre: 'Fútbol 5 - Cancha 1', deporte: 'FUTBOL5' },
  { nombre: 'Fútbol 5 - Cancha 2', deporte: 'FUTBOL5' },
  { nombre: 'Pádel - Cancha 1', deporte: 'PADEL' },
  { nombre: 'Pádel - Cancha 2', deporte: 'PADEL' },
  { nombre: 'Pádel - Cancha 3', deporte: 'PADEL' },
  { nombre: 'Tenis - Cancha 1', deporte: 'TENIS' },
];

const usuarios = [
  { nombre: 'Socio de Prueba', email: 'socio@prueba.com', esSocio: true },
  { nombre: 'No Socio de Prueba', email: 'nosocio@prueba.com', esSocio: false },
];

async function main() {
  for (const c of canchas) {
    await prisma.cancha.upsert({ where: { nombre: c.nombre }, update: {}, create: c });
  }
  for (const u of usuarios) {
    await prisma.usuario.upsert({ where: { email: u.email }, update: {}, create: u });
  }
  const todasCanchas = await prisma.cancha.findMany({ orderBy: { id: 'asc' } });
  const todosUsuarios = await prisma.usuario.findMany({ orderBy: { id: 'asc' } });
  console.log('Canchas:', todasCanchas.map((c) => `${c.id}=${c.nombre}`).join(' | '));
  console.log('Usuarios:', todosUsuarios.map((u) => `${u.id}=${u.nombre}`).join(' | '));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

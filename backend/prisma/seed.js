const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding canchas...');
  
  // Limpiar canchas previas
  await prisma.cancha.deleteMany({});

  // Infraestructura según REGLA-1.1
  await prisma.cancha.createMany({
    data: [
      { nombre: 'Fútbol 5 - Cancha 1', deporte: 'FUTBOL_5' },
      { nombre: 'Fútbol 5 - Cancha 2', deporte: 'FUTBOL_5' },
      { nombre: 'Pádel - Cancha 1', deporte: 'PADEL' },
      { nombre: 'Pádel - Cancha 2', deporte: 'PADEL' },
      { nombre: 'Pádel - Cancha 3', deporte: 'PADEL' },
      { nombre: 'Tenis - Cancha Central', deporte: 'TENIS' },
    ],
  });

  console.log('Canchas creadas con éxito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$connect();
  });
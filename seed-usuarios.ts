import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;

  // Hashear las contraseñas pedidas
  const hashSuperadmin = await bcrypt.hash('UyuaGemetro', saltRounds);
  const hashAvefenix = await bcrypt.hash('ingresoavefenix', saltRounds);

  // Insertar o actualizar Superadmin
  const user1 = await prisma.user.upsert({
    where: { username: 'Superadmin' },
    update: {},
    create: {
      username: 'Superadmin',
      passwordHash: hashSuperadmin,
      name: 'Super Administrador',
    },
  });

  // Insertar o actualizar avefenix
  const user2 = await prisma.user.upsert({
    where: { username: 'avefenix' },
    update: {},
    create: {
      username: 'avefenix',
      passwordHash: hashAvefenix,
      name: 'Ave Fénix',
    },
  });

  console.log('¡Usuarios insertados con éxito en la base de datos remota!');
  console.log({ user1, user2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
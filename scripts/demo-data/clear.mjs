// Borra SOLO los datos de prueba cargados por seed.mjs.
//
// Uso:    npm run demo:clear
//
// Identifica a los socios demo por las dos marcas a la vez (notes = "[DEMO]" y DNI 99xxxxxx),
// así nunca toca socios reales. Membresías, pagos e ingresos se borran en cascada.
// Los planes no se borran: son los planes por defecto de la app.

import { PrismaClient } from "@prisma/client";

const DEMO_NOTE = "[DEMO]";
const DEMO_DNI_PREFIX = "99";

const prisma = new PrismaClient();

async function main() {
  const where = { notes: DEMO_NOTE, dni: { startsWith: DEMO_DNI_PREFIX } };
  const count = await prisma.member.count({ where });
  if (count === 0) {
    console.log("No hay datos demo para borrar.");
    return;
  }
  const { count: deleted } = await prisma.member.deleteMany({ where });
  console.log(`Borrados ${deleted} socios demo (con sus membresías, pagos e ingresos).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

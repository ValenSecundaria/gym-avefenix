import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.SEED_ADMIN_USER || "admin";
  const password = process.env.SEED_ADMIN_PASS || "admin123";
  const name = process.env.SEED_ADMIN_NAME || "Administrador";
  const gymPhone = process.env.SEED_GYM_PHONE || "5492915768403";

  console.log(`[Seed] Inicializando administrador: ${username}`);
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { username },
    update: { name, role: "ADMIN", gymPhone },
    create: { username, passwordHash, name, role: "ADMIN", gymPhone },
  });
  console.log(`[Seed] Usuario admin asegurado: ${admin.username} (ID: ${admin.id})`);

  // Disciplinas base iniciales
  const musc = await prisma.discipline.upsert({
    where: { name: "Musculación" },
    update: { isActive: true },
    create: { name: "Musculación", isActive: true },
  });

  const func = await prisma.discipline.upsert({
    where: { name: "Funcional" },
    update: { isActive: true },
    create: { name: "Funcional", isActive: true },
  });

  // Planes base iniciales
  const defaultPlans = [
    { name: "Pase Diario", disciplineId: musc.id, category: "DIARIO", durationDays: 1, price: 3000 },
    { name: "Musculación Libre Mensual", disciplineId: musc.id, category: "MENSUAL_LIBRE", durationDays: 30, price: 25000 },
    { name: "Funcional 3 Días/Sem", disciplineId: func.id, category: "MENSUAL_DIAS", allowedDaysPerWeek: 3, durationDays: 30, price: 22000 },
  ];

  for (const p of defaultPlans) {
    const existing = await prisma.plan.findFirst({ where: { name: p.name, deletedAt: null } });
    if (!existing) {
      await prisma.plan.create({ data: p });
      console.log(`[Seed] Plan creado: ${p.name}`);
    }
  }

  console.log("[Seed] Base de datos lista para operar.");
}

main()
  .catch((e) => {
    console.error("[Seed] Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

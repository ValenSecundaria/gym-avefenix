import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seed inicial White-Label — LA ROCA GYM (Córdoba 535, Bahía Blanca)
 * Horarios: Lun a Vie 07:30–11:30 y 19:00–23:00 hs | Sábados 19:00–21:00 hs | Domingos Cerrado
 */
async function main() {
  const username = (process.env.SEED_ADMIN_USER || "Superadmin").trim();
  const password = process.env.SEED_ADMIN_PASS || "UyuaGemetro";
  const name = (process.env.SEED_ADMIN_NAME || "Administración La Roca Gym").trim();
  const rawPhone = (process.env.SEED_GYM_PHONE || "5492915175675").trim();
  const gymPhone = rawPhone.length > 0 ? rawPhone : null;

  console.log(`[Seed] Inicializando sede LA ROCA GYM (Córdoba 535)...`);
  console.log(`[Seed] Configurando usuario administrador: ${username}`);
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { username },
    update: { passwordHash, name, role: "ADMIN", gymPhone },
    create: { username, passwordHash, name, role: "ADMIN", gymPhone },
  });
  console.log(`[Seed] Usuario admin asegurado: ${admin.username} (${admin.name} - ID: ${admin.id})`);

  const musc = await prisma.discipline.upsert({
    where: { name: "Musculación" },
    update: { isActive: true },
    create: { name: "Musculación", isActive: true },
  });

  const acond = await prisma.discipline.upsert({
    where: { name: "Acondicionamiento y Fuerza" },
    update: { isActive: true },
    create: { name: "Acondicionamiento y Fuerza", isActive: true },
  });

  const defaultPlans = [
    {
      name: "Pase Diario",
      disciplineId: musc.id,
      category: "DIARIO",
      allowedDaysPerWeek: null,
      durationDays: 1,
      price: 4500,
    },
    {
      name: "Musculación 2 Días / Semana",
      disciplineId: musc.id,
      category: "MENSUAL_DIAS",
      allowedDaysPerWeek: 2,
      durationDays: 30,
      price: 23000,
    },
    {
      name: "Musculación 3 Días / Semana",
      disciplineId: musc.id,
      category: "MENSUAL_DIAS",
      allowedDaysPerWeek: 3,
      durationDays: 30,
      price: 26000,
    },
    {
      name: "Musculación Pase Libre (Lun a Sáb)",
      disciplineId: musc.id,
      category: "MENSUAL_LIBRE",
      allowedDaysPerWeek: null,
      durationDays: 30,
      price: 30000,
    },
    {
      name: "Fuerza + Acondicionamiento 3 Días",
      disciplineId: acond.id,
      category: "MENSUAL_DIAS",
      allowedDaysPerWeek: 3,
      durationDays: 30,
      price: 28000,
    },
    {
      name: "Pase Total Libre La Roca",
      disciplineId: acond.id,
      category: "MENSUAL_LIBRE",
      allowedDaysPerWeek: null,
      durationDays: 30,
      price: 33000,
    },
  ];

  for (const planData of defaultPlans) {
    const existing = await prisma.plan.findFirst({
      where: { name: planData.name, deletedAt: null },
    });
    if (!existing) {
      await prisma.plan.create({ data: planData });
      console.log(`[Seed] Plan creado: ${planData.name}`);
    } else {
      console.log(`[Seed] Plan existente conservado: ${planData.name}`);
    }
  }

  console.log("[Seed] LA ROCA GYM lista para operar.");
}

main()
  .catch((e) => {
    console.error("[Seed] Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seed inicial White-Label — EJERCICIO SALUD GYM (Estomba 1364, Bahía Blanca)
 *Horario operativo: Lunes a Viernes de 08:00 a 22:00 hs (Sábados, Domingos y Feriados cerrado).
 */
async function main() {
  const username = (process.env.SEED_ADMIN_USER || "Superadmin").trim();
  const password = process.env.SEED_ADMIN_PASS || "UyuaGemetro";
  const name = (process.env.SEED_ADMIN_NAME || "Administración Salud GYM").trim();
  const rawPhone = (process.env.SEED_GYM_PHONE || "").trim();
  const gymPhone = rawPhone.length > 0 ? rawPhone : null;

  console.log(`[Seed] Inicializando sede EJERCICIO SALUD GYM (Estomba 1364)...`);
  console.log(`[Seed] Configurando administrador: ${username}`);
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { username },
    update: { passwordHash, name, role: "ADMIN", gymPhone },
    create: { username, passwordHash, name, role: "ADMIN", gymPhone },
  });
  console.log(`[Seed] Administrador asegurado: ${admin.username} (${admin.name} - ID: ${admin.id})`);

  // Disciplinas alineadas con la identidad EJERCICIO SALUD GYM (Musculación, HIIT / Funcional y Salud Activa)
  const disciplinesSpec = [
    "Musculación",
    "Funcional & HIIT",
    "Salud y Acondicionamiento",
  ];

  const disciplinesByName = {};
  for (const dName of disciplinesSpec) {
    const disc = await prisma.discipline.upsert({
      where: { name: dName },
      update: { isActive: true },
      create: { name: dName, isActive: true },
    });
    disciplinesByName[dName] = disc;
    console.log(`[Seed] Disciplina activa: ${disc.name}`);
  }

  // Catálogo inicial de planes acorde a la franja Lunes a Viernes (hasta 5 días hábiles por semana)
  const initialPlans = [
    {
      name: "Pase Diario",
      disciplineId: disciplinesByName["Musculación"].id,
      category: "DIARIO",
      allowedDaysPerWeek: null,
      durationDays: 1,
      price: 4500,
    },
    {
      name: "Musculación 3 Días / Semana",
      disciplineId: disciplinesByName["Musculación"].id,
      category: "MENSUAL_DIAS",
      allowedDaysPerWeek: 3,
      durationDays: 30,
      price: 26000,
    },
    {
      name: "Musculación Libre (Lun a Vie)",
      disciplineId: disciplinesByName["Musculación"].id,
      category: "MENSUAL_LIBRE",
      allowedDaysPerWeek: null,
      durationDays: 30,
      price: 30000,
    },
    {
      name: "Funcional & HIIT 2 Días / Semana",
      disciplineId: disciplinesByName["Funcional & HIIT"].id,
      category: "MENSUAL_DIAS",
      allowedDaysPerWeek: 2,
      durationDays: 30,
      price: 24000,
    },
    {
      name: "Funcional & HIIT 3 Días / Semana",
      disciplineId: disciplinesByName["Funcional & HIIT"].id,
      category: "MENSUAL_DIAS",
      allowedDaysPerWeek: 3,
      durationDays: 30,
      price: 27000,
    },
    {
      name: "Plan Salud Activa (3 Días / Sem)",
      disciplineId: disciplinesByName["Salud y Acondicionamiento"].id,
      category: "MENSUAL_DIAS",
      allowedDaysPerWeek: 3,
      durationDays: 30,
      price: 26000,
    },
    {
      name: "Pase Integral Salud + Fuerza Libre",
      disciplineId: disciplinesByName["Salud y Acondicionamiento"].id,
      category: "MENSUAL_LIBRE",
      allowedDaysPerWeek: null,
      durationDays: 30,
      price: 34000,
    },
  ];

  for (const planData of initialPlans) {
    const existing = await prisma.plan.findFirst({
      where: { name: planData.name, deletedAt: null },
    });
    if (!existing) {
      await prisma.plan.create({ data: planData });
      console.log(`[Seed] Plan creado: ${planData.name}`);
    } else {
      console.log(`[Seed] Plan ya existente (conservado): ${planData.name}`);
    }
  }

  console.log("[Seed] EJERCICIO SALUD GYM listo para operar.");
}

main()
  .catch((e) => {
    console.error("[Seed] Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

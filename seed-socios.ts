import { PrismaClient, PlanCategory, MembershipStatus, AccessStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando seed de socios para pruebas de estados ---');

  // 1. Asegurar disciplina base
  const disciplina = await prisma.discipline.upsert({
    where: { name: 'Musculación' },
    update: {},
    create: {
      name: 'Musculación',
      isActive: true,
    },
  });

  // 2. Asegurar planes: Pase Libre y Plan 3 Días por Semana
  const planLibre = await prisma.plan.upsert({
    where: { id: 'seed-plan-libre' },
    update: {},
    create: {
      id: 'seed-plan-libre',
      name: 'Musculación Pase Libre',
      disciplineId: disciplina.id,
      category: PlanCategory.MENSUAL_LIBRE,
      durationDays: 30,
      price: 25000,
      isActive: true,
    },
  });

  const planTresDias = await prisma.plan.upsert({
    where: { id: 'seed-plan-3dias' },
    update: {},
    create: {
      id: 'seed-plan-3dias',
      name: 'Musculación 3 Días por Semana',
      disciplineId: disciplina.id,
      category: PlanCategory.MENSUAL_DIAS,
      allowedDaysPerWeek: 3,
      durationDays: 30,
      price: 20000,
      isActive: true,
    },
  });

  const now = new Date();

  // =========================================================================
  // SOCIO 1: 99999999 -> ESTADO: HABILITADO
  // Membresía activa vigente por 30 días
  // =========================================================================
  const validUntilHabilitado = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000);
  const socio1 = await prisma.member.upsert({
    where: { dni: '99999999' },
    update: {
      fullName: 'Juan Habilitado (Prueba)',
      phone: '2914001111',
      isActive: true,
    },
    create: {
      dni: '99999999',
      fullName: 'Juan Habilitado (Prueba)',
      phone: '2914001111',
      isActive: true,
    },
  });

  // Limpiar membresías y check-ins previos si ya existían para garantizar estado limpio
  await prisma.checkIn.deleteMany({ where: { memberId: socio1.id } });
  await prisma.membership.deleteMany({ where: { memberId: socio1.id } });

  await prisma.membership.create({
    data: {
      memberId: socio1.id,
      planId: planLibre.id,
      startDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      validUntil: validUntilHabilitado,
      status: MembershipStatus.ACTIVA,
    },
  });

  // =========================================================================
  // SOCIO 2: 99999998 -> ESTADO: CUOTA_VENCIDA
  // Membresía vencida hace 5 días
  // =========================================================================
  const validUntilVencido = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const socio2 = await prisma.member.upsert({
    where: { dni: '99999998' },
    update: {
      fullName: 'Pedro Vencido (Prueba)',
      phone: '2914002222',
      isActive: true,
    },
    create: {
      dni: '99999998',
      fullName: 'Pedro Vencido (Prueba)',
      phone: '2914002222',
      isActive: true,
    },
  });

  await prisma.checkIn.deleteMany({ where: { memberId: socio2.id } });
  await prisma.membership.deleteMany({ where: { memberId: socio2.id } });

  await prisma.membership.create({
    data: {
      memberId: socio2.id,
      planId: planLibre.id,
      startDate: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
      validUntil: validUntilVencido,
      status: MembershipStatus.VENCIDA,
    },
  });

  // =========================================================================
  // SOCIO 3: 99999997 -> ESTADO: LIMITE_ALCANZADO
  // Plan de 3 días x semana, cuota vigente pero con 3 ingresos registrados en la semana actual
  // =========================================================================
  const validUntilLimite = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
  const socio3 = await prisma.member.upsert({
    where: { dni: '99999997' },
    update: {
      fullName: 'Lucas Límite (Prueba)',
      phone: '2914003333',
      isActive: true,
    },
    create: {
      dni: '99999997',
      fullName: 'Lucas Límite (Prueba)',
      phone: '2914003333',
      isActive: true,
    },
  });

  await prisma.checkIn.deleteMany({ where: { memberId: socio3.id } });
  await prisma.membership.deleteMany({ where: { memberId: socio3.id } });

  await prisma.membership.create({
    data: {
      memberId: socio3.id,
      planId: planTresDias.id,
      startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      validUntil: validUntilLimite,
      status: MembershipStatus.ACTIVA,
    },
  });

  // Registramos 3 check-ins previos dentro de esta misma semana (ej. hoy, ayer y anteayer)
  // para que alcance el cupo de 3 ingresos semanales
  await prisma.checkIn.createMany({
    data: [
      {
        memberId: socio3.id,
        status: AccessStatus.HABILITADO,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        memberId: socio3.id,
        status: AccessStatus.HABILITADO,
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        memberId: socio3.id,
        status: AccessStatus.HABILITADO,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // hace 2 horas
      },
    ],
  });

  console.log('✅ Socios creados exitosamente:');
  console.log('  1. DNI: 99999999 -> Juan Habilitado -> Estado: HABILITADO (Cuota al día, pase libre)');
  console.log('  2. DNI: 99999998 -> Pedro Vencido   -> Estado: CUOTA_VENCIDA (Venció hace 5 días)');
  console.log('  3. DNI: 99999997 -> Lucas Límite    -> Estado: LIMITE_ALCANZADO (Plan 3 días/sem, ya consumió sus 3 ingresos)');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seed de socios:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


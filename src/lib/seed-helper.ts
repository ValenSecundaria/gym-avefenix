import bcrypt from 'bcryptjs';
import { PlanCategory } from '@prisma/client';
import { prisma } from './prisma';

let initialized = false;

/**
 * Verifica e inserta de forma idempotente el usuario administrador por defecto
 * y los planes base del gimnasio si las tablas se encuentran vacías.
 */
export async function ensureInitialGymData(): Promise<void> {
  if (initialized) return;

  try {
    const [userCount, planCount] = await Promise.all([
      prisma.user.count(),
      prisma.plan.count(),
    ]);

    if (userCount === 0) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
          username: 'admin',
          passwordHash,
          name: 'Administrador Ave Fénix',
        },
      });
    }

    if (planCount === 0) {
      await prisma.plan.createMany({
        data: [
          {
            name: 'Pase Libre Mensual',
            category: PlanCategory.MENSUAL_LIBRE,
            allowedDaysPerWeek: null,
            durationDays: 30,
            price: 25000,
            isActive: true,
          },
          {
            name: 'Plan 3 Días / Semana',
            category: PlanCategory.MENSUAL_DIAS,
            allowedDaysPerWeek: 3,
            durationDays: 30,
            price: 20000,
            isActive: true,
          },
          {
            name: 'Pase Diario',
            category: PlanCategory.DIARIO,
            allowedDaysPerWeek: 1,
            durationDays: 1,
            price: 3500,
            isActive: true,
          },
        ],
      });
    }

    initialized = true;
  } catch (error) {
    console.warn(
      '[seed-helper] No se pudieron inicializar los datos semilla (verifique conexión a PostgreSQL):',
      error instanceof Error ? error.message : error
    );
  }
}

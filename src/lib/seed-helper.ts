import { PlanCategory } from '@prisma/client';
import { prisma } from './prisma';

let initialized = false;

/**
 * Verifica e inserta de forma idempotente los planes base del gimnasio
 * si la tabla se encuentra vacía.
 */
export async function ensureInitialGymData(): Promise<void> {
  if (initialized) return;

  try {
    const planCount = await prisma.plan.count();

    if (planCount === 0) {
      await prisma.plan.createMany({
        data: [
          {
            name: 'Pase Libre Mensual',
            category: PlanCategory.MENSUAL_LIBRE,
            allowedDaysPerWeek: null,
            durationDays: 30,
            price: 55000,
            isActive: true,
          },
          {
            name: 'Plan 3 Días / Semana',
            category: PlanCategory.MENSUAL_DIAS,
            allowedDaysPerWeek: 3,
            durationDays: 30,
            price: 50000,
            isActive: true,
          },
          {
            name: 'Pase Diario',
            category: PlanCategory.DIARIO,
            allowedDaysPerWeek: 1,
            durationDays: 1,
            price: 55000,
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

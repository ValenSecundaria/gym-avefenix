"use server";

import { prisma } from "@/lib/prisma";
import { getActionSession } from "@/lib/auth/require-session";
import type { Prisma } from "@prisma/client";

const PAYMENTS_PAGE_SIZE = 50;

export interface PaymentsHistoryFilters {
  planId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
}

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  method: "EFECTIVO" | "TRANSFERENCIA";
  notes: string | null;
  paidAt: string;
  registeredByName: string | null;
  member: {
    id: string;
    fullName: string;
    dni: string;
    photoFilename: string | null;
  };
  plan: {
    id: string;
    name: string;
    category: string;
  } | null;
  validUntil: string | null;
}

export interface PaymentsHistoryResult {
  payments: PaymentHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  totals: {
    totalAmount: number;
    totalEfectivo: { amount: number; count: number };
    totalTransferencia: { amount: number; count: number };
  };
}

export async function getPaymentsHistoryAction(
  filters?: PaymentsHistoryFilters
): Promise<{ success: true; data: PaymentsHistoryResult } | { success: false; error: string }> {
  const session = await getActionSession();
  if (!session || session.role === "PROFESOR") {
    return { success: false, error: "No autorizado para ver pagos." };
  }

  const where: Prisma.PaymentWhereInput = {};

  if (filters?.planId && filters.planId !== "ALL") {
    where.membership = { planId: filters.planId };
  }

  const search = filters?.search?.trim();
  if (search) {
    where.member = {
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { dni: { contains: search } },
      ],
    };
  }

  if (filters?.startDate || filters?.endDate) {
    where.paidAt = {};
    if (filters.startDate) where.paidAt.gte = new Date(filters.startDate);
    if (filters.endDate) where.paidAt.lte = new Date(filters.endDate);
  }

  const requestedPage = Math.max(1, Math.floor(filters?.page ?? 1));

  const [total, aggregateTotal, aggregateEfectivo, aggregateTransferencia] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.aggregate({
      where,
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { ...where, method: "EFECTIVO" },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.payment.aggregate({
      where: { ...where, method: "TRANSFERENCIA" },
      _sum: { amount: true },
      _count: { id: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAYMENTS_PAGE_SIZE));
  const safePage = Math.min(requestedPage, totalPages);

  const rows = await prisma.payment.findMany({
    where,
    orderBy: { paidAt: "desc" },
    skip: (safePage - 1) * PAYMENTS_PAGE_SIZE,
    take: PAYMENTS_PAGE_SIZE,
    include: {
      member: { select: { id: true, fullName: true, dni: true, photoFilename: true } },
      membership: {
        include: {
          plan: { select: { id: true, name: true, category: true } },
        },
      },
    },
  });

  const payments: PaymentHistoryItem[] = rows.map((row) => ({
    id: row.id,
    amount: Number(row.amount),
    method: row.method,
    notes: row.notes,
    paidAt: row.paidAt.toISOString(),
    registeredByName: row.registeredByName,
    member: row.member,
    plan: row.membership?.plan ?? null,
    validUntil: row.membership?.validUntil ? row.membership.validUntil.toISOString() : null,
  }));

  return {
    success: true,
    data: {
      payments,
      total,
      page: safePage,
      pageSize: PAYMENTS_PAGE_SIZE,
      totalPages,
      totals: {
        totalAmount: Number(aggregateTotal._sum.amount ?? 0),
        totalEfectivo: {
          amount: Number(aggregateEfectivo._sum.amount ?? 0),
          count: aggregateEfectivo._count.id,
        },
        totalTransferencia: {
          amount: Number(aggregateTransferencia._sum.amount ?? 0),
          count: aggregateTransferencia._count.id,
        },
      },
    },
  };
}

import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

const isSuccess = (s: string) => s === "SUCCESS";
const pctChange = (curr: number, prev: number) =>
  prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;

/** Headline KPIs comparing the last 30 days against the prior 30-day window. */
export async function getKpis() {
  const now = new Date();
  const d30 = subDays(now, 30);
  const d60 = subDays(now, 60);

  const [curr, prev] = await Promise.all([
    prisma.transaction.findMany({
      where: { createdAt: { gte: d30 } },
      select: { amount: true, fee: true, status: true },
    }),
    prisma.transaction.findMany({
      where: { createdAt: { gte: d60, lt: d30 } },
      select: { amount: true, status: true },
    }),
  ]);

  const currSucc = curr.filter((t) => isSuccess(t.status));
  const prevSucc = prev.filter((t) => isSuccess(t.status));
  const revenue = currSucc.reduce((s, t) => s + t.amount, 0);
  const prevRevenue = prevSucc.reduce((s, t) => s + t.amount, 0);
  const fees = curr.reduce((s, t) => s + t.fee, 0);
  const successRate = curr.length ? (currSucc.length / curr.length) * 100 : 0;
  const prevSuccessRate = prev.length
    ? (prevSucc.length / prev.length) * 100
    : 0;

  return {
    revenue,
    revenueChange: pctChange(revenue, prevRevenue),
    volume: curr.length,
    volumeChange: pctChange(curr.length, prev.length),
    successRate,
    successRateChange: successRate - prevSuccessRate,
    avgTransaction: currSucc.length ? revenue / currSucc.length : 0,
    fees,
  };
}

export type Kpis = Awaited<ReturnType<typeof getKpis>>;

/** Daily successful revenue + fees for the last N days (area chart). */
export async function getRevenueSeries(days = 30) {
  const start = subDays(new Date(), days);
  const rows = await prisma.transaction.findMany({
    where: { createdAt: { gte: start }, status: "SUCCESS" },
    select: { amount: true, fee: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const buckets = new Map<string, { revenue: number; fees: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const key = subDays(new Date(), i).toISOString().slice(0, 10);
    buckets.set(key, { revenue: 0, fees: 0 });
  }
  for (const r of rows) {
    const key = r.createdAt.toISOString().slice(0, 10);
    const b = buckets.get(key);
    if (b) {
      b.revenue += r.amount;
      b.fees += r.fee;
    }
  }

  return Array.from(buckets.entries()).map(([date, v]) => ({
    date,
    revenue: Math.round(v.revenue),
    fees: Math.round(v.fees),
  }));
}

/** Transaction count grouped by status (donut chart). */
export async function getStatusBreakdown() {
  const grouped = await prisma.transaction.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  return grouped.map((g) => ({ status: g.status, count: g._count._all }));
}

/** Successful revenue grouped by payment method (bar chart). */
export async function getMethodBreakdown() {
  const rows = await prisma.transaction.findMany({
    where: { status: "SUCCESS" },
    select: { method: true, amount: true },
  });
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.method, (map.get(r.method) ?? 0) + r.amount);
  return Array.from(map.entries()).map(([method, revenue]) => ({
    method,
    revenue: Math.round(revenue),
  }));
}

/** Top merchants by successful revenue. */
export async function getTopMerchants(limit = 5) {
  const grouped = await prisma.transaction.groupBy({
    by: ["merchantId"],
    where: { status: "SUCCESS" },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: limit,
  });
  const merchants = await prisma.merchant.findMany({
    where: { id: { in: grouped.map((g) => g.merchantId) } },
    select: { id: true, name: true, category: true },
  });
  const byId = new Map(merchants.map((m) => [m.id, m]));

  return grouped.map((g) => ({
    id: g.merchantId,
    name: byId.get(g.merchantId)?.name ?? "Unknown",
    category: byId.get(g.merchantId)?.category ?? "",
    revenue: Math.round(g._sum.amount ?? 0),
  }));
}

/** Latest transactions with merchant name (recent activity table). */
export async function getRecentTransactions(limit = 8) {
  const rows = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { merchant: { select: { name: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    merchant: r.merchant.name,
    amount: r.amount,
    currency: r.currency,
    status: r.status,
    method: r.method,
    createdAt: r.createdAt,
  }));
}

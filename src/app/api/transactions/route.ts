import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

const SORTABLE = new Set(["createdAt", "amount", "fee", "status", "method"]);

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(0, Number(sp.get("page") ?? 0) || 0);
  const pageSize = Math.min(50, Math.max(5, Number(sp.get("pageSize") ?? 10) || 10));
  const q = (sp.get("q") ?? "").trim();
  const status = sp.get("status") ?? "";
  const method = sp.get("method") ?? "";
  const sortByRaw = sp.get("sortBy") ?? "createdAt";
  const sortBy = SORTABLE.has(sortByRaw) ? sortByRaw : "createdAt";
  const sortDir: "asc" | "desc" = sp.get("sortDir") === "asc" ? "asc" : "desc";

  const where: Prisma.TransactionWhereInput = {};
  if (status) where.status = status;
  if (method) where.method = method;
  if (q) where.merchant = { name: { contains: q } };

  const orderBy = { [sortBy]: sortDir } as Prisma.TransactionOrderByWithRelationInput;

  const [rows, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { merchant: { select: { name: true } } },
      orderBy,
      skip: page * pageSize,
      take: pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  return NextResponse.json({
    rows: rows.map((r) => ({
      id: r.id,
      merchant: r.merchant.name,
      amount: r.amount,
      currency: r.currency,
      status: r.status,
      method: r.method,
      cardBrand: r.cardBrand,
      fee: r.fee,
      createdAt: r.createdAt,
    })),
    total,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  });
}

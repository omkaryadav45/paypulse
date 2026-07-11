import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const merchantId = req.nextUrl.searchParams.get("merchantId");
  if (!merchantId) return NextResponse.json({ feeCodes: [] });

  const feeCodes = await prisma.feeCode.findMany({
    where: { merchantId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      code: true,
      type: true,
      rate: true,
      perItem: true,
      active: true,
    },
  });

  return NextResponse.json({ feeCodes });
}

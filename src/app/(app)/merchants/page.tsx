import { prisma } from "@/lib/prisma";
import { getCurrentRole } from "@/lib/auth";
import { MerchantsView } from "@/components/merchants/merchants-view";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function MerchantsPage() {
  const [merchants, revenueByMerchant, role] = await Promise.all([
    prisma.merchant.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { transactions: true } } },
    }),
    prisma.transaction.groupBy({
      by: ["merchantId"],
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    }),
    getCurrentRole(),
  ]);

  const revMap = new Map(
    revenueByMerchant.map((r) => [r.merchantId, r._sum.amount ?? 0]),
  );

  const rows = merchants.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    category: m.category,
    mcc: m.mcc,
    country: m.country,
    status: m.status,
    txns: m._count.transactions,
    revenue: Math.round(revMap.get(m.id) ?? 0),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Merchants</CardTitle>
        <CardDescription>
          Onboard and manage merchants. Admins can create, edit, and delete;
          Analysts have read-only access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MerchantsView merchants={rows} canEdit={role === "ADMIN"} />
      </CardContent>
    </Card>
  );
}

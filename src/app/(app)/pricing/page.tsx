import { prisma } from "@/lib/prisma";
import { getCurrentRole } from "@/lib/auth";
import { PricingGrid } from "@/components/pricing/pricing-grid";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const [merchants, role] = await Promise.all([
    prisma.merchant.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    getCurrentRole(),
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing &amp; fees</CardTitle>
        <CardDescription>
          Configure per-merchant fee schedules with inline validation. Admins can
          edit and save; Analysts have read-only access (RBAC).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PricingGrid merchants={merchants} canEdit={role === "ADMIN"} />
      </CardContent>
    </Card>
  );
}

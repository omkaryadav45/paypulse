import { DollarSign, CreditCard, CheckCircle2, Receipt } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatusDonut } from "@/components/dashboard/status-donut";
import { MethodBar } from "@/components/dashboard/method-bar";
import {
  getKpis,
  getRevenueSeries,
  getStatusBreakdown,
  getMethodBreakdown,
  getTopMerchants,
  getRecentTransactions,
} from "@/lib/queries";
import {
  formatCompactCurrency,
  formatCurrency,
  formatDateTime,
  formatNumber,
  formatPercent,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [kpis, series, statuses, methods, topMerchants, recent] =
    await Promise.all([
      getKpis(),
      getRevenueSeries(30),
      getStatusBreakdown(),
      getMethodBreakdown(),
      getTopMerchants(5),
      getRecentTransactions(8),
    ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Revenue (30d)"
          value={formatCompactCurrency(kpis.revenue)}
          change={kpis.revenueChange}
          icon={DollarSign}
        />
        <KpiCard
          title="Transactions (30d)"
          value={formatNumber(kpis.volume)}
          change={kpis.volumeChange}
          icon={CreditCard}
        />
        <KpiCard
          title="Success Rate"
          value={formatPercent(kpis.successRate)}
          change={kpis.successRateChange}
          icon={CheckCircle2}
        />
        <KpiCard
          title="Fees Collected (30d)"
          value={formatCompactCurrency(kpis.fees)}
          icon={Receipt}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
            <CardDescription>
              Daily successful revenue over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={series} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction status</CardTitle>
            <CardDescription>Distribution across all transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusDonut data={statuses} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by method</CardTitle>
            <CardDescription>Successful revenue split</CardDescription>
          </CardHeader>
          <CardContent>
            <MethodBar data={methods} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top merchants</CardTitle>
            <CardDescription>By successful revenue (all time)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topMerchants.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.category}</p>
                </div>
                <p className="text-sm font-semibold">
                  {formatCurrency(m.revenue)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>
            Latest transactions across all merchants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 font-medium">Merchant</th>
                  <th className="pb-2 font-medium">Method</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                  <th className="pb-2 text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="py-2.5 font-medium">{t.merchant}</td>
                    <td className="py-2.5 text-muted-foreground">{t.method}</td>
                    <td className="py-2.5">
                      <Badge status={t.status} />
                    </td>
                    <td className="py-2.5 text-right font-medium">
                      {formatCurrency(t.amount, t.currency)}
                    </td>
                    <td className="py-2.5 text-right text-muted-foreground">
                      {formatDateTime(t.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

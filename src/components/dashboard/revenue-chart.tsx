"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  fontSize: 12,
  color: "var(--foreground)",
  boxShadow: "0 4px 16px rgb(0 0 0 / 0.12)",
} as const;

export function RevenueChart({
  data,
}: {
  data: { date: string; revenue: number; fees: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => d.slice(5)}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          minTickGap={28}
        />
        <YAxis
          tickFormatter={(v: number) => formatCompactCurrency(v)}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          width={60}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: "var(--muted-foreground)" }}
          formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--primary)"
          strokeWidth={2}
          fill="url(#revFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

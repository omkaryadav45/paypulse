"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS: Record<string, string> = {
  SUCCESS: "#10b981",
  FAILED: "#ef4444",
  PENDING: "#f59e0b",
  REFUNDED: "#0ea5e9",
};

export function StatusDonut({
  data,
}: {
  data: { status: string; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          innerRadius={56}
          outerRadius={88}
          paddingAngle={2}
          strokeWidth={0}
        >
          {data.map((d) => (
            <Cell key={d.status} fill={COLORS[d.status] ?? "#6366f1"} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            fontSize: 12,
            color: "var(--foreground)",
          }}
        />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

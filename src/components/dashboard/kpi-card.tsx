import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  /** When true, a negative change is treated as good (e.g. failure rate). */
  invertChange?: boolean;
}

export function KpiCard({
  title,
  value,
  change,
  icon: Icon,
  invertChange = false,
}: KpiCardProps) {
  const positive =
    change === undefined ? true : invertChange ? change < 0 : change >= 0;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
        {change !== undefined && (
          <p
            className={cn(
              "mt-1 flex items-center gap-1 text-xs font-medium",
              positive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400",
            )}
          >
            {positive ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {Math.abs(change).toFixed(1)}%
            <span className="font-normal text-muted-foreground">
              vs prev 30d
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

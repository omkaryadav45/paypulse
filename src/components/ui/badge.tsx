import { cn } from "@/lib/utils";
import { STATUS_STYLES } from "@/lib/constants";
import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** A known status key (SUCCESS, ACTIVE, FAILED...) to auto-apply colors. */
  status?: string;
}

export function Badge({ status, className, children, ...props }: BadgeProps) {
  const styles = status
    ? (STATUS_STYLES[status] ?? "bg-muted text-muted-foreground")
    : "bg-muted text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles,
        className,
      )}
      {...props}
    >
      {children ?? status}
    </span>
  );
}

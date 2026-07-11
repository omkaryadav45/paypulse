"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Store,
  Receipt,
  Sparkles,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/merchants", label: "Merchants", icon: Store },
  { href: "/pricing", label: "Pricing & Fees", icon: Receipt },
  { href: "/assistant", label: "AI Assistant", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar md:flex">
      <div className="flex h-16 items-center gap-2.5 border-b px-6">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold tracking-tight">PayPulse</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Portfolio demo</p>
        <p>Built by Omkar Yadav</p>
      </div>
    </aside>
  );
}

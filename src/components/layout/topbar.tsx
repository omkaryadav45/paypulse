"use client";

import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/login/actions";
import { cn } from "@/lib/utils";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/merchants": "Merchants",
  "/pricing": "Pricing & Fees",
  "/assistant": "AI Assistant",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Topbar({
  user,
}: {
  user: { name: string; role: string };
}) {
  const pathname = usePathname();
  const key = Object.keys(titles).find((k) => pathname.startsWith(k));
  const title = key ? titles[key] : "PayPulse";
  const isAdmin = user.role === "ADMIN";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="flex items-center gap-2 rounded-full border py-1 pl-1 pr-3">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {initials(user.name)}
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-medium">{user.name}</p>
            <p
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wide",
                isAdmin ? "text-primary" : "text-muted-foreground",
              )}
            >
              {user.role}
            </p>
          </div>
        </div>
        <form action={logout}>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            type="submit"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}

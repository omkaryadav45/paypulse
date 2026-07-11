"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Eye, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@paypulse.dev");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function doLogin(mail: string, pass: string) {
    setLoading(true);
    setError(null);
    const res = await login(mail, pass);
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Activity className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight">PayPulse</span>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h1 className="text-lg font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Access the payments analytics dashboard.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              doLogin(email, password);
            }}
            className="mt-5 space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>

          <div className="mt-5">
            <p className="text-center text-xs text-muted-foreground">
              Quick demo login
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => doLogin("admin@paypulse.dev", "password123")}
                disabled={loading}
              >
                <ShieldCheck className="h-4 w-4" /> Admin
              </Button>
              <Button
                variant="outline"
                onClick={() => doLogin("analyst@paypulse.dev", "password123")}
                disabled={loading}
              >
                <Eye className="h-4 w-4" /> Analyst
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Admin can edit · Analyst is read-only (RBAC demo)
        </p>
      </div>
    </div>
  );
}

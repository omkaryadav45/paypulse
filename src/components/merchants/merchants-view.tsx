"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { MerchantForm } from "./merchant-form";
import { deleteMerchant } from "@/app/(app)/merchants/actions";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { MerchantInput } from "@/lib/validation";

type Merchant = {
  id: string;
  name: string;
  email: string;
  category: string;
  mcc: string;
  country: string;
  status: string;
  txns: number;
  revenue: number;
};

export function MerchantsView({
  merchants,
  canEdit,
}: {
  merchants: Merchant[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Merchant | null>(null);
  const [deleting, setDeleting] = useState<Merchant | null>(null);
  const [busy, setBusy] = useState(false);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(m: Merchant) {
    setEditing(m);
    setFormOpen(true);
  }
  function onSuccess() {
    setFormOpen(false);
    setEditing(null);
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    await deleteMerchant(deleting.id);
    setBusy(false);
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{merchants.length} merchants</p>
        {canEdit && (
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add merchant
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Merchant</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Transactions</th>
              <th className="px-4 py-3 text-right font-medium">Revenue</th>
              {canEdit && (
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {merchants.map((m) => (
              <tr key={m.id} className="border-t hover:bg-muted/40">
                <td className="px-4 py-3">
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.email} · MCC {m.mcc} · {m.country}
                  </p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{m.category}</td>
                <td className="px-4 py-3">
                  <Badge status={m.status} />
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatNumber(m.txns)}
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums">
                  {formatCurrency(m.revenue)}
                </td>
                {canEdit && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(m)}
                        aria-label="Edit merchant"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleting(m)}
                        aria-label="Delete merchant"
                        className="text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit merchant" : "Add merchant"}
        description={
          editing
            ? "Update merchant details."
            : "Onboard a new merchant to PayPulse."
        }
      >
        <MerchantForm
          merchant={
            editing
              ? {
                  id: editing.id,
                  name: editing.name,
                  email: editing.email,
                  category: editing.category as MerchantInput["category"],
                  mcc: editing.mcc,
                  country: editing.country,
                  status: editing.status as MerchantInput["status"],
                }
              : null
          }
          onSuccess={onSuccess}
          onCancel={() => setFormOpen(false)}
        />
      </Dialog>

      <Dialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete merchant"
        description={`This permanently removes "${deleting?.name}" along with its transactions and fee codes.`}
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={busy}>
            Delete merchant
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

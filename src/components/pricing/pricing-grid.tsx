"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { FEE_TYPES } from "@/lib/constants";
import { feeCodeSchema, type FeeCodeInput } from "@/lib/validation";
import { updateFeeCodes } from "@/app/(app)/pricing/actions";

type Merchant = { id: string; name: string };
type RowErrors = Partial<Record<keyof FeeCodeInput, string>>;

function validateRow(row: FeeCodeInput): RowErrors {
  const res = feeCodeSchema.safeParse(row);
  if (res.success) return {};
  const errs: RowErrors = {};
  for (const issue of res.error.issues) {
    const key = issue.path[0] as keyof FeeCodeInput;
    if (key && !errs[key]) errs[key] = issue.message;
  }
  return errs;
}

export function PricingGrid({
  merchants,
  canEdit,
}: {
  merchants: Merchant[];
  canEdit: boolean;
}) {
  const queryClient = useQueryClient();
  const [merchantId, setMerchantId] = useState(merchants[0]?.id ?? "");
  const [rows, setRows] = useState<FeeCodeInput[]>([]);
  const [lastFeeCodes, setLastFeeCodes] = useState<FeeCodeInput[] | undefined>(
    undefined,
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["fee-codes", merchantId],
    queryFn: async () => {
      const res = await fetch(`/api/fee-codes?merchantId=${merchantId}`);
      if (!res.ok) throw new Error("Failed to load fee codes");
      return (await res.json()) as { feeCodes: FeeCodeInput[] };
    },
    enabled: !!merchantId,
  });

  // Sync fetched fee codes into editable local state when the merchant changes
  // (adjusting state during render — React's recommended alternative to an effect).
  if (data?.feeCodes && data.feeCodes !== lastFeeCodes) {
    setLastFeeCodes(data.feeCodes);
    setRows(data.feeCodes.map((f) => ({ ...f })));
  }

  const errors = useMemo(() => rows.map(validateRow), [rows]);
  const hasErrors = errors.some((e) => Object.keys(e).length > 0);
  const dirty = useMemo(() => {
    if (!data) return false;
    return JSON.stringify(rows) !== JSON.stringify(data.feeCodes);
  }, [rows, data]);

  function update(i: number, patch: Partial<FeeCodeInput>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
    setSaved(false);
    setServerError(null);
  }

  async function onSave() {
    if (hasErrors || !dirty) return;
    setSaving(true);
    setServerError(null);
    const result = await updateFeeCodes(merchantId, rows);
    setSaving(false);
    if (result.ok) {
      setSaved(true);
      queryClient.setQueryData(["fee-codes", merchantId], { feeCodes: rows });
    } else {
      setServerError(result.error);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Merchant</label>
          <Select
            value={merchantId}
            onChange={(e) => {
              setMerchantId(e.target.value);
              setSaved(false);
              setServerError(null);
            }}
            className="min-w-52"
          >
            {merchants.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
        </div>

        {canEdit ? (
          <div className="flex items-center gap-3">
            {saved && !dirty && (
              <span className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
                <Check className="h-4 w-4" /> Saved
              </span>
            )}
            {serverError && (
              <span className="text-sm text-rose-600 dark:text-rose-400">
                {serverError}
              </span>
            )}
            <Button onClick={onSave} disabled={saving || hasErrors || !dirty}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save changes
            </Button>
          </div>
        ) : (
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            View only — switch to Admin to edit
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Fee name</th>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Rate (%)</th>
              <th className="px-4 py-3 font-medium">Per item ($)</th>
              <th className="px-4 py-3 font-medium">Active</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-t">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-8 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row, i) => {
                  const e = errors[i];
                  const disabled = !canEdit;
                  const isFlat = row.type === "FLAT";
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "border-t align-top",
                        isFetching && "opacity-60",
                      )}
                    >
                      <td className="px-4 py-3">
                        <Input
                          value={row.name}
                          disabled={disabled}
                          onChange={(ev) => update(i, { name: ev.target.value })}
                          className={cn(
                            "min-w-40",
                            e.name && "border-danger focus-visible:ring-danger",
                          )}
                        />
                        {e.name && (
                          <p className="mt-1 text-xs text-danger">{e.name}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          value={row.code}
                          disabled={disabled}
                          onChange={(ev) =>
                            update(i, { code: ev.target.value.toUpperCase() })
                          }
                          className={cn(
                            "w-28",
                            e.code && "border-danger focus-visible:ring-danger",
                          )}
                        />
                        {e.code && (
                          <p className="mt-1 text-xs text-danger">{e.code}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={row.type}
                          disabled={disabled}
                          onChange={(ev) =>
                            update(i, {
                              type: ev.target.value as FeeCodeInput["type"],
                            })
                          }
                        >
                          {FEE_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          step="0.01"
                          value={row.rate}
                          disabled={disabled || isFlat}
                          onChange={(ev) =>
                            update(i, { rate: ev.target.valueAsNumber || 0 })
                          }
                          className={cn(
                            "w-24",
                            e.rate && "border-danger focus-visible:ring-danger",
                          )}
                        />
                        {e.rate && (
                          <p className="mt-1 text-xs text-danger">{e.rate}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          step="0.01"
                          value={row.perItem}
                          disabled={disabled}
                          onChange={(ev) =>
                            update(i, { perItem: ev.target.valueAsNumber || 0 })
                          }
                          className={cn(
                            "w-24",
                            e.perItem &&
                              "border-danger focus-visible:ring-danger",
                          )}
                        />
                        {e.perItem && (
                          <p className="mt-1 text-xs text-danger">{e.perItem}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          disabled={disabled}
                          aria-label="Toggle active"
                          onClick={() => update(i, { active: !row.active })}
                          className={cn(
                            "relative h-6 w-11 rounded-full transition-colors",
                            row.active ? "bg-primary" : "bg-muted",
                            disabled && "opacity-50",
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                              row.active ? "left-[22px]" : "left-0.5",
                            )}
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

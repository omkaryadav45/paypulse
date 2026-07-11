"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { merchantSchema, type MerchantInput } from "@/lib/validation";
import { MERCHANT_CATEGORIES, MERCHANT_STATUSES } from "@/lib/constants";
import { createMerchant, updateMerchant } from "@/app/(app)/merchants/actions";

type Merchant = MerchantInput & { id: string };

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function MerchantForm({
  merchant,
  onSuccess,
  onCancel,
}: {
  merchant?: Merchant | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MerchantInput>({
    resolver: zodResolver(merchantSchema),
    defaultValues: merchant ?? {
      name: "",
      email: "",
      category: "Retail",
      mcc: "",
      country: "US",
      status: "ACTIVE",
    },
  });

  async function onSubmit(values: MerchantInput) {
    setServerError(null);
    const result = merchant
      ? await updateMerchant(merchant.id, values)
      : await createMerchant(values);
    if (result.ok) onSuccess();
    else setServerError(result.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Business name" error={errors.name?.message}>
        <Input {...register("name")} placeholder="Acme Corp" />
      </Field>
      <Field label="Billing email" error={errors.email?.message}>
        <Input {...register("email")} placeholder="billing@acme.com" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Category" error={errors.category?.message}>
          <Select {...register("category")} className="w-full">
            {MERCHANT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status" error={errors.status?.message}>
          <Select {...register("status")} className="w-full">
            {MERCHANT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="MCC code" error={errors.mcc?.message}>
          <Input {...register("mcc")} placeholder="5411" />
        </Field>
        <Field label="Country" error={errors.country?.message}>
          <Input {...register("country")} placeholder="US" />
        </Field>
      </div>

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {merchant ? "Save changes" : "Create merchant"}
        </Button>
      </div>
    </form>
  );
}

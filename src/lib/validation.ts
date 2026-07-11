import { z } from "zod";
import {
  FEE_TYPES,
  MERCHANT_CATEGORIES,
  MERCHANT_STATUSES,
} from "@/lib/constants";

/** A single editable fee-code row. */
export const feeCodeSchema = z
  .object({
    id: z.string(),
    name: z.string().trim().min(1, "Name is required").max(60, "Too long"),
    code: z.string().trim().min(1, "Code is required").max(20, "Too long"),
    type: z.enum(FEE_TYPES),
    rate: z
      .number({ message: "Number required" })
      .min(0, "Must be ≥ 0")
      .max(100, "Rate cannot exceed 100%"),
    perItem: z
      .number({ message: "Number required" })
      .min(0, "Must be ≥ 0")
      .max(1000, "Per-item cannot exceed 1000"),
    active: z.boolean(),
  })
  .refine((f) => (f.type === "FLAT" ? f.perItem > 0 : true), {
    message: "Flat fees need a per-item amount",
    path: ["perItem"],
  })
  .refine((f) => (f.type !== "FLAT" ? f.rate > 0 : true), {
    message: "Percentage/interchange fees need a rate",
    path: ["rate"],
  });

export type FeeCodeInput = z.infer<typeof feeCodeSchema>;

export const feeCodesSchema = z.array(feeCodeSchema);

/** Merchant create/edit form. */
export const merchantSchema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(80),
  email: z.string().trim().email("Enter a valid email"),
  category: z.enum(MERCHANT_CATEGORIES),
  mcc: z.string().regex(/^\d{4}$/, "MCC must be 4 digits"),
  country: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, "Use a 2-letter country code"),
  status: z.enum(MERCHANT_STATUSES),
});

export type MerchantInput = z.infer<typeof merchantSchema>;

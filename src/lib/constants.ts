/**
 * Enum-like constants (SQLite has no native enums). These are the single source
 * of truth for allowed values and are reused by Zod schemas for validation.
 */

export const ROLES = ["ADMIN", "ANALYST"] as const;
export type Role = (typeof ROLES)[number];

export const TXN_STATUSES = ["SUCCESS", "FAILED", "PENDING", "REFUNDED"] as const;
export type TxnStatus = (typeof TXN_STATUSES)[number];

export const PAYMENT_METHODS = ["CARD", "ACH", "WALLET"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const CARD_BRANDS = ["VISA", "MASTERCARD", "AMEX", "DISCOVER"] as const;
export type CardBrand = (typeof CARD_BRANDS)[number];

export const MERCHANT_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export type MerchantStatus = (typeof MERCHANT_STATUSES)[number];

export const FEE_TYPES = ["PERCENTAGE", "FLAT", "INTERCHANGE"] as const;
export type FeeType = (typeof FEE_TYPES)[number];

export const MERCHANT_CATEGORIES = [
  "Retail",
  "Travel",
  "SaaS",
  "Food & Beverage",
  "Gaming",
  "Healthcare",
  "Education",
] as const;
export type MerchantCategory = (typeof MERCHANT_CATEGORIES)[number];

export const CURRENCIES = ["USD", "EUR", "GBP", "INR"] as const;
export type Currency = (typeof CURRENCIES)[number];

/** Tailwind badge classes per status — used across tables and cards. */
export const STATUS_STYLES: Record<string, string> = {
  SUCCESS: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  ACTIVE: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  INACTIVE: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
  FAILED: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  SUSPENDED: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  REFUNDED: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
};

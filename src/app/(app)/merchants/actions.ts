"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { merchantSchema } from "@/lib/validation";
import { requireRole } from "@/lib/auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createMerchant(raw: unknown): Promise<ActionResult> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return { ok: false, error: "Not authorized" };

  const parsed = merchantSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  try {
    await prisma.merchant.create({
      data: { ...parsed.data, country: parsed.data.country.toUpperCase() },
    });
  } catch {
    return { ok: false, error: "A merchant with this email already exists." };
  }

  revalidatePath("/merchants");
  return { ok: true };
}

export async function updateMerchant(
  id: string,
  raw: unknown,
): Promise<ActionResult> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return { ok: false, error: "Not authorized" };

  const parsed = merchantSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  try {
    await prisma.merchant.update({
      where: { id },
      data: { ...parsed.data, country: parsed.data.country.toUpperCase() },
    });
  } catch {
    return { ok: false, error: "Could not update merchant." };
  }

  revalidatePath("/merchants");
  return { ok: true };
}

export async function deleteMerchant(id: string): Promise<ActionResult> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return { ok: false, error: "Not authorized" };

  try {
    await prisma.merchant.delete({ where: { id } });
  } catch {
    return { ok: false, error: "Could not delete merchant." };
  }

  revalidatePath("/merchants");
  return { ok: true };
}

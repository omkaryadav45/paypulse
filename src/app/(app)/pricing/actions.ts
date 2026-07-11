"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { feeCodesSchema } from "@/lib/validation";
import { requireRole } from "@/lib/auth";

export type SaveResult = { ok: true } | { ok: false; error: string };

/**
 * Persist edited fee codes for a merchant. Admin-only (RBAC), validated with
 * Zod, and each row is verified to belong to the target merchant before write.
 */
export async function updateFeeCodes(
  merchantId: string,
  raw: unknown,
): Promise<SaveResult> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return { ok: false, error: "Not authorized" };

  const parsed = feeCodesSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Validation failed — please fix the fields." };
  }

  const existing = await prisma.feeCode.findMany({
    where: { merchantId },
    select: { id: true },
  });
  const allowed = new Set(existing.map((f) => f.id));
  for (const fc of parsed.data) {
    if (!allowed.has(fc.id)) {
      return { ok: false, error: "A fee code does not belong to this merchant." };
    }
  }

  await prisma.$transaction(
    parsed.data.map((fc) =>
      prisma.feeCode.update({
        where: { id: fc.id },
        data: {
          name: fc.name,
          code: fc.code,
          type: fc.type,
          rate: fc.rate,
          perItem: fc.perItem,
          active: fc.active,
        },
      }),
    ),
  );

  revalidatePath("/pricing");
  return { ok: true };
}

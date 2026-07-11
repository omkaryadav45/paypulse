"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/auth";
import type { Role } from "@/lib/constants";

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!user) return { ok: false, error: "Invalid email or password" };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { ok: false, error: "Invalid email or password" };

  await createSession({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
  });
  return { ok: true };
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

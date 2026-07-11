import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Reuse a single PrismaClient across hot reloads in development to avoid
 * exhausting the database connection pool. Prisma 7 uses driver adapters;
 * libSQL works for local SQLite files and hosted Turso/libSQL in production.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
    authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

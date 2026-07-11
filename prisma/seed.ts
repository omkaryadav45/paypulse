import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

// ---------- deterministic RNG (mulberry32) for reproducible seed data ----------
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const round2 = (n: number) => Math.round(n * 100) / 100;

// ---------- weighted picker ----------
function weighted<T extends string>(entries: [T, number][]): T {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [val, w] of entries) {
    if ((r -= w) <= 0) return val;
  }
  return entries[0][0];
}

const MERCHANTS: { name: string; category: string; mcc: string; country: string }[] = [
  { name: "Aurora Retail Co.", category: "Retail", mcc: "5411", country: "US" },
  { name: "Skyline Travel", category: "Travel", mcc: "4722", country: "US" },
  { name: "NimbusSoft", category: "SaaS", mcc: "5734", country: "US" },
  { name: "Bytewave Cloud", category: "SaaS", mcc: "5734", country: "GB" },
  { name: "Harvest Grocers", category: "Food & Beverage", mcc: "5411", country: "US" },
  { name: "PixelForge Games", category: "Gaming", mcc: "7994", country: "US" },
  { name: "Meridian Health", category: "Healthcare", mcc: "8062", country: "US" },
  { name: "BrightPath Academy", category: "Education", mcc: "8299", country: "IN" },
  { name: "Coastline Apparel", category: "Retail", mcc: "5651", country: "US" },
  { name: "Voyage Airlines", category: "Travel", mcc: "3000", country: "US" },
  { name: "Fork & Flame", category: "Food & Beverage", mcc: "5812", country: "US" },
  { name: "Quantum Analytics", category: "SaaS", mcc: "7372", country: "GB" },
];

async function main() {
  console.log("Clearing existing data...");
  await prisma.transaction.deleteMany();
  await prisma.feeCode.deleteMany();
  await prisma.merchant.deleteMany();
  await prisma.user.deleteMany();

  // ---------- users ----------
  const passwordHash = await bcrypt.hash("password123", 10);
  await prisma.user.createMany({
    data: [
      { email: "admin@paypulse.dev", name: "Alex Admin", passwordHash, role: "ADMIN" },
      { email: "analyst@paypulse.dev", name: "Ana Analyst", passwordHash, role: "ANALYST" },
    ],
  });
  console.log("Created 2 users (admin + analyst).");

  // ---------- merchants + fee codes ----------
  const merchantIds: string[] = [];
  for (const m of MERCHANTS) {
    const merchant = await prisma.merchant.create({
      data: {
        name: m.name,
        email: `billing@${m.name.toLowerCase().replace(/[^a-z]/g, "")}.com`,
        category: m.category,
        mcc: m.mcc,
        country: m.country,
        status: weighted([
          ["ACTIVE", 8],
          ["INACTIVE", 1],
          ["SUSPENDED", 1],
        ]),
        feeCodes: {
          create: [
            { name: "Interchange Fee", code: "IC-STD", type: "INTERCHANGE", rate: round2(1.5 + rand()), perItem: 0, active: true },
            { name: "Processing Fee", code: "PROC", type: "PERCENTAGE", rate: 2.9, perItem: 0.3, active: true },
            { name: "Chargeback Fee", code: "CB", type: "FLAT", rate: 0, perItem: 15, active: true },
            { name: "Monthly Platform Fee", code: "MONTHLY", type: "FLAT", rate: 0, perItem: 25, active: rand() > 0.3 },
          ],
        },
      },
    });
    merchantIds.push(merchant.id);
  }
  console.log(`Created ${merchantIds.length} merchants with fee codes.`);

  // ---------- transactions over the last 90 days ----------
  const now = Date.now();
  const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;
  const txns: {
    merchantId: string;
    amount: number;
    currency: string;
    status: string;
    method: string;
    cardBrand: string | null;
    fee: number;
    createdAt: Date;
  }[] = [];

  const TOTAL = 1200;
  for (let i = 0; i < TOTAL; i++) {
    const merchantId = pick(merchantIds);
    const method = weighted([
      ["CARD", 70],
      ["ACH", 15],
      ["WALLET", 15],
    ]);
    const status = weighted([
      ["SUCCESS", 80],
      ["FAILED", 8],
      ["PENDING", 5],
      ["REFUNDED", 7],
    ]);
    const amount = round2(5 + rand() * rand() * 1995); // skew toward smaller amounts
    const fee = round2(amount * 0.029 + 0.3);
    const cardBrand = method === "CARD" ? pick(["VISA", "MASTERCARD", "AMEX", "DISCOVER"]) : null;
    const createdAt = new Date(now - Math.floor(rand() * NINETY_DAYS));

    txns.push({
      merchantId,
      amount,
      currency: weighted([
        ["USD", 80],
        ["EUR", 8],
        ["GBP", 7],
        ["INR", 5],
      ]),
      status,
      method,
      cardBrand,
      fee: status === "FAILED" ? 0 : fee,
      createdAt,
    });
  }

  // batch insert
  const BATCH = 200;
  for (let i = 0; i < txns.length; i += BATCH) {
    await prisma.transaction.createMany({ data: txns.slice(i, i + BATCH) });
  }
  console.log(`Created ${txns.length} transactions.`);
  console.log("Seed complete ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

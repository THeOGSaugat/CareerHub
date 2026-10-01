// src/lib/db.js
// ─── Prisma Client Singleton ──────────────────────────────────
// Uses Prisma v7's Neon adapter so app queries go through Neon's pooler.
// Ensures a single Prisma Client instance is reused across hot reloads
// in development, preventing unnecessary reconnects.

// src/lib/db.js

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString,
  });

  return new PrismaClient({
    adapter,
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
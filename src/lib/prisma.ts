// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // allow globalThis.prisma to exist without TypeScript errors
  var prisma: PrismaClient | undefined;
}

// Use a singleton pattern to prevent multiple instances in dev
export const prisma: PrismaClient =
  globalThis.prisma ||
  new PrismaClient({
    log: ["query"], // optional: log SQL queries
  });

// store in globalThis for dev
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

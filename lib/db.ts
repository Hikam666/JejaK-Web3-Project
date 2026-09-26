import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const SUPABASE_DEFAULT_URL =
  "postgresql://postgres.yrvpsailtiiiukjggnfn:Muhliswijaya@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require&connect_timeout=20";

const activeDatabaseUrl =
  process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ""
    ? process.env.DATABASE_URL
    : SUPABASE_DEFAULT_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: activeDatabaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

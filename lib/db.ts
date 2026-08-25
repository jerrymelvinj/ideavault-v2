import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

/**
 * Ensures a valid User record exists in Postgres DB to prevent Foreign Key errors
 */
export async function getOrCreateDefaultUser() {
  const defaultEmail = "alex@ideavault.app";
  
  let user = await db.user.findFirst({
    where: { email: defaultEmail },
  });

  if (!user) {
    user = await db.user.upsert({
      where: { email: defaultEmail },
      update: {},
      create: {
        id: "default-user-id",
        name: "Alex Rivera",
        email: defaultEmail,
        preferences: JSON.stringify({ theme: "dark", aiProactive: true }),
      },
    });
  }

  return user;
}

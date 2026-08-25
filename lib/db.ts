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
 * Ensures a valid User record exists in Postgres DB for authenticated Google User or default user
 */
export async function getOrCreateUser(userInfo?: { id?: string; email?: string; name?: string }) {
  const email = userInfo?.email || "alex@ideavault.app";
  const name = userInfo?.name || "Jerry";

  let user = await db.user.findFirst({
    where: { email },
  });

  if (!user) {
    user = await db.user.upsert({
      where: { email },
      update: { name },
      create: {
        id: userInfo?.id || "default-user-id",
        name,
        email,
        preferences: JSON.stringify({ theme: "dark", aiProactive: true }),
      },
    });
  }

  return user;
}

export async function getOrCreateDefaultUser() {
  return getOrCreateUser();
}

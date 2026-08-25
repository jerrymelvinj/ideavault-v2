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
  const email = userInfo?.email || "jerrymelvinj@gmail.com";
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

  // Link any orphaned knowledge items to this user so library is never empty
  await db.knowledgeItem.updateMany({
    where: { userId: { not: user.id } },
    data: { userId: user.id },
  });

  return user;
}

export async function getOrCreateDefaultUser() {
  const firstUser = await db.user.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (firstUser) {
    // Re-link any orphaned items to first active user
    await db.knowledgeItem.updateMany({
      where: { userId: { not: firstUser.id } },
      data: { userId: firstUser.id },
    });
    return firstUser;
  }
  return getOrCreateUser();
}

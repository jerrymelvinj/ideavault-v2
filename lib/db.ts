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
  const name = userInfo?.name || "Jerry Melvin J";

  let user = await db.user.findFirst({
    where: { OR: [{ email }, { id: "default-user-id" }] },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        name,
        email,
        preferences: JSON.stringify({ theme: "dark", aiProactive: true }),
      },
    });
  } else if (user.email !== email) {
    user = await db.user.update({
      where: { id: user.id },
      data: { email, name },
    });
  }

  return user;
}

export async function getOrCreateDefaultUser() {
  const user = await db.user.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (user) return user;
  return getOrCreateUser();
}

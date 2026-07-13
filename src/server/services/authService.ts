import bcrypt from "bcryptjs";
import { prisma } from "@/server/db/prisma";
import { UnauthorizedError } from "@/server/errors";
import { createSessionToken } from "@/server/auth/jwt";
import type { LoginInput } from "@/server/validation/schemas";

export async function login(input: LoginInput): Promise<string> {
  const admin = await prisma.admin.findUnique({ where: { email: input.email } });

  if (!admin) {
    throw new UnauthorizedError("Invalid email or password.");
  }

  const passwordMatches = await bcrypt.compare(input.password, admin.passwordHash);
  if (!passwordMatches) {
    throw new UnauthorizedError("Invalid email or password.");
  }

  return createSessionToken({ adminId: admin.id, email: admin.email });
}

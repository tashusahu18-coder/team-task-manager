import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { signAuthToken } from "../../utils/jwt.js";
import type { LoginInput, SignupInput } from "@team-task-manager/shared";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true
};

export const signup = async (input: SignupInput) => {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });

  if (existingUser) {
    throw new AppError(409, "A user with this email already exists", "EMAIL_IN_USE");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash
    },
    select: publicUserSelect
  });

  return {
    user,
    token: signAuthToken({ userId: user.id })
  };
};

export const login = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    },
    token: signAuthToken({ userId: user.id })
  };
};

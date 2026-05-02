import type { RegisterInput, LoginInput } from "@garnish/shared";
import { prisma } from "../../libs/prisma";
import { hashPassword, comparePassword } from "../../utils/password";
import { generateTokens, verifyRefreshToken } from "../../utils/jwt";
import { conflict, unauthorized, notFound } from "../../utils/api-error";

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw conflict("A user with this email already exists");
  }

  const hashedPassword = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const tokens = generateTokens(user.id);

  return { user, tokens };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw unauthorized("Invalid email or password");
  }

  const isPasswordValid = await comparePassword(input.password, user.password);

  if (!isPasswordValid) {
    throw unauthorized("Invalid email or password");
  }

  const tokens = generateTokens(user.id);

  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, tokens };
}

export async function refreshUserToken(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true },
  });

  if (!user) {
    throw unauthorized("User not found");
  }

  return generateTokens(user.id);
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw notFound("User not found");
  }

  return user;
}

import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";

import type { ExtendedPrismaClient } from "@/types/prismaConnector";

type JWTTokenContent = {
  userId: string;
};

export const SESSION_AGE_IN_MS = 15 * 1000 * 60 * 1000;
export const createSession = async (
  userId: string,
  prisma: ExtendedPrismaClient,
) => {
  const expiresAt = new Date(new Date().valueOf() + SESSION_AGE_IN_MS);
  const secret = nanoid(16);

  await prisma.session.create({
    data: {
      userId,
      expiresAt,
      secret,
    },
  });

  const content: JWTTokenContent = { userId };
  return jwt.sign(content, secret, {
    expiresIn: SESSION_AGE_IN_MS,
  });
};

export const verifySession = async (
  token: string,
  userId: string,
  prisma: ExtendedPrismaClient,
) => {
  const sessions = await prisma.session.findMany({
    where: {
      userId,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!sessions.length) return null;

  for (let i = 0; i < sessions.length; i += 1) {
    const { secret } = sessions[i];
    try {
      jwt.verify(token, secret);
      return userId;
    } catch (e) {
      // eslint-disable-next-line no-continue
      continue;
    }
  }

  return null;
};

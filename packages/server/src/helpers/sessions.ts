import { randomBytes } from "crypto";

import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

import type { PrismaClient } from "@prisma/client";

type JWTTokenContent = {
  userId: string;
};

export const SESSION_AGE_IN_MS = 15 * 1000 * 60;
export const createSession = async (userId: string, prisma: PrismaClient) => {
  const expiresAt = new Date(new Date().valueOf() + SESSION_AGE_IN_MS);
  const secret = uuidv4({
    random: randomBytes(16),
  });

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
  prisma: PrismaClient,
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

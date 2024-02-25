import bcrypt from "bcrypt";

import { v4 as uuidv4 } from "uuid";

import generateString from "@test/utils/randomString";

import type { PrismaClient } from "@prisma/client";

export default async (prisma: PrismaClient) => {
  const image = process.env.USER_PROFILE_PICTURE_PLACEHOLDER_URL || "";
  const john = await prisma.user.create({
    data: {
      displayName: "John",
      email: "john@example.com",
      password: bcrypt.hashSync("password-john", 1),
      image,
    },
  });

  const mike = await prisma.user.create({
    data: {
      displayName: "Mike",
      email: "mike@example.com",
      password: bcrypt.hashSync("password-mike", 1),
      image,
    },
  });

  await prisma.user.create({
    data: {
      displayName: "Zapp",
      email: "zapp@example.com",
      password: bcrypt.hashSync("password-zapp", 1),
      image,
    },
  });

  for (let i = 0; i < 3; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await prisma.conversation.create({
      data: {
        title: uuidv4(),
        participants: {
          create: [
            {
              userId: john.id,
            },
            {
              userId: mike.id,
            },
          ],
        },
        messages: {
          create: [...Array(10)].map(() => ({
            content: generateString(Math.ceil(Math.random() * 5)),
            user: {
              connect: {
                id: Math.random() > 0.5 ? john.id : mike.id,
              },
            },
          })),
        },
      },
    });
  }
};

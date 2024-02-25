import bcrypt from "bcrypt";

import { nanoid } from "nanoid";

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
        title: nanoid(50),
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
            content: nanoid(Math.ceil(Math.random() * 1000)),
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

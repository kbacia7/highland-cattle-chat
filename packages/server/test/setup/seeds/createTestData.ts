import bcrypt from "bcrypt";

import { nanoid } from "nanoid";

import { testUsersCredientials } from "@test/utils/authorize";

import type { PrismaClient, User } from "@prisma/client";

export default async (prisma: PrismaClient) => {
  const image = process.env.USER_PROFILE_PICTURE_PLACEHOLDER_URL || "";
  const createTestUsersPromises: Array<Promise<User>> = [];
  Object.keys(testUsersCredientials).forEach(
    (id: keyof typeof testUsersCredientials) => {
      createTestUsersPromises.push(
        prisma.user.create({
          data: {
            displayName: id.charAt(0) + id.slice(1).toLowerCase(),
            email: testUsersCredientials[id].email,
            password: bcrypt.hashSync(testUsersCredientials[id].password, 1),
            image,
          },
        }),
      );
    },
  );

  const [john, mike] = await Promise.all(createTestUsersPromises);

  for (let i = 0; i < 3; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await prisma.conversation.create({
      data: {
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
          create: [...Array(10)].map((value, index) => ({
            content: nanoid(Math.ceil(Math.random() * 100)),
            createdAt: new Date(
              new Date().valueOf() - (20 - index) * 1000 * 60 * 60,
            ),
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

import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { Redis } from "ioredis";

import generateString from "@test/utils/randomString";

const prisma = new PrismaClient({
  datasourceUrl: process.env.JEST_TESTS_DATABASE_URL,
});

const redis = new Redis();

async function main() {
  await redis.flushall();
  const john = await prisma.user.create({
    data: {
      displayName: "John",
      email: "john@example.com",
      password: bcrypt.hashSync("password-john", 1),
      image: "https://picsum.photos/200",
    },
  });

  const mike = await prisma.user.create({
    data: {
      displayName: "Mike",
      email: "mike@example.com",
      password: bcrypt.hashSync("password-mike", 1),
      image: "https://picsum.photos/200",
    },
  });

  await prisma.user.create({
    data: {
      displayName: "Zapp",
      email: "zapp@example.com",
      password: bcrypt.hashSync("password-zapp", 1),
      image: "https://picsum.photos/200",
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
}
main()
  .then(async () => {
    await prisma.$disconnect();
    await redis.disconnect();
    process.exit();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await redis.disconnect();
    process.exit(1);
  });

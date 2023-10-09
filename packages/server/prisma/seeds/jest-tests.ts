import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

import generateString from "@test/utils/randomString";

const prisma = new PrismaClient({
  datasourceUrl: process.env.JEST_TESTS_DATABASE_URL,
});

async function main() {
  const john = await prisma.user.create({
    data: {
      displayName: "John",
      login: "john",
    },
  });

  const mike = await prisma.user.create({
    data: {
      displayName: "Mike",
      login: "mike",
    },
  });

  await prisma.user.create({
    data: {
      displayName: "Zapp",
      login: "zapp",
    },
  });

  for (let i = 0; i < 3; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await prisma.conversation.create({
      data: {
        title: uuidv4(),
        image: "https://picsum.photos/200",
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
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: process.env.JEST_TESTS_DATABASE_URL,
});

async function main() {
  const res = await prisma.$runCommandRaw({
    listCollections: 1,
    nameOnly: true,
  });

  // @ts-ignore
  res.cursor?.firstBatch?.forEach(async (collectionJson) => {
    await prisma.$runCommandRaw({
      drop: collectionJson.name,
    });
  });
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

import type { PrismaClient } from "@prisma/client";

export default async (prisma: PrismaClient) => {
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
};

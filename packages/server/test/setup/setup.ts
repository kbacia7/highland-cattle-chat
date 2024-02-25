import { PrismaClient } from "@prisma/client";
import { Redis } from "ioredis";

import { Storage } from "@google-cloud/storage";

import { beforeAll } from "vitest";

import createTestData from "./seeds/createTestData";
import createBaseData from "./seeds/createBaseData";
import clearStorage from "./seeds/clearStorage";
import clearCollections from "./seeds/clearCollections";

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var prisma: PrismaClient;
  // eslint-disable-next-line vars-on-top, no-var
  var redis: Redis;
}

beforeAll(async () => {
  const prisma = globalThis.prisma || new PrismaClient();
  const redis = globalThis.redis || new Redis();
  const storage = new Storage();
  const bucket = storage.bucket(process.env.GOOGLE_STORAGE_BUCKET_NAME || "");

  globalThis.prisma = prisma;
  globalThis.redis = redis;

  await clearStorage(bucket);
  await clearCollections(prisma);
  await redis.flushall();
  await createBaseData(prisma, bucket);
  await createTestData(prisma);
}, 30000);

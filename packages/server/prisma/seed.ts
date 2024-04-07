import { PrismaClient } from "@prisma/client";
import { Storage } from "@google-cloud/storage";

import createBaseData from "@test/setup/seeds/createBaseData";

const prisma = new PrismaClient();
const storage = new Storage();
const bucket = storage.bucket(process.env.GOOGLE_STORAGE_BUCKET_NAME || "");

await createBaseData(prisma, bucket);

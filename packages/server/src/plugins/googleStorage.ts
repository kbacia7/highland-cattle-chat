import fp from "fastify-plugin";

import { Storage } from "@google-cloud/storage";

import type { FastifyPluginCallback } from "fastify";
import type { Bucket } from "@google-cloud/storage";

declare module "fastify" {
  interface FastifyInstance {
    storageBucket: Bucket;
  }
}

const googleStoragePlugin: FastifyPluginCallback = async (
  fastify,
  options,
  done,
) => {
  const storage = new Storage();
  const bucket = storage.bucket(process.env.GOOGLE_STORAGE_BUCKET_NAME || "");

  if (!fastify.storageBucket) {
    fastify.decorate("storageBucket", bucket);
  }

  done();
};

export default fp(googleStoragePlugin);

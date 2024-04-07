import fp from "fastify-plugin";
import Redis from "ioredis";

import type { FastifyPluginCallback } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    cache: Redis;
  }
}

const cacheConnector: FastifyPluginCallback = async (
  fastify,
  options,
  done,
) => {
  const redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
  });
  if (!fastify.cache) {
    fastify.decorate("cache", redis);
  }

  done();
};

export default fp(cacheConnector, { name: "fastify-cache-manager" });

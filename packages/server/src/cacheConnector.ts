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
  const redis = new Redis();
  if (!fastify.cache) {
    fastify.decorate("cache", redis);
  }

  done();
};

export default fp(cacheConnector, { name: "fastify-cache-manager" });

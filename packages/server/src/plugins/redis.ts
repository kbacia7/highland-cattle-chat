import Redis from "ioredis";
import fp from "fastify-plugin";

import type { FastifyPluginCallback } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    cache: Redis;
    pubRedis: Redis;
    subRedis: Redis;
  }
}

const createRedisClient = () =>
  new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
  });

const redisPlugin: FastifyPluginCallback = async (fastify, options, done) => {
  const pubRedis = createRedisClient();
  const subRedis = createRedisClient();
  const redis = createRedisClient();

  if (!fastify.cache) {
    fastify.decorate("cache", redis);
    fastify.decorate("pubRedis", pubRedis);
    fastify.decorate("subRedis", subRedis);
  }

  done();
};

export default fp(redisPlugin);

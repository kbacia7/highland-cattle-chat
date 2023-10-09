import type { createPrismaClient } from "@/prismaConnector";

export type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;
export type CacheOptions = {
  cache?: {
    ttl: number;
  };
};

declare module "fastify" {
  interface FastifyInstance {
    prisma: ExtendedPrismaClient;
  }
}

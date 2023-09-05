import fp from "fastify-plugin";

import { PrismaClient } from "@prisma/client";

import type { FastifyPluginCallback } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

const prismaConnector: FastifyPluginCallback = async (
  fastify,
  options,
  done,
) => {
  const prisma = new PrismaClient({
    log: ["warn", "error"],
  });

  if (!fastify.prisma) {
    fastify.decorate("prisma", prisma);
  }

  // TODO: Handle onClose
  done();
};

export default fp(prismaConnector, { name: "fastify-prisma" });

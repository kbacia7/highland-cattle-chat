import fp from "fastify-plugin";

import { nanoid } from "nanoid";

import type { FastifyPluginCallback } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    serverId: string;
  }
}

const serverIdPlugin: FastifyPluginCallback = async (
  fastify,
  options,
  done,
) => {
  if (!fastify.serverId) {
    fastify.decorate("serverId", nanoid(4));
  }

  done();
};

export default fp(serverIdPlugin, { name: "server-id" });

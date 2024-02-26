import fp from "fastify-plugin";

import { Worker, Queue } from "bullmq";

import { getMessageStackStaleKey } from "@routes/realTime/helpers/messagesStack";

import type { Message } from "@prisma/client";
import type { FastifyPluginCallback } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    messagesStackWorker: Worker;
    messagesStackQueue: Queue;
  }
}

const workersConnector: FastifyPluginCallback = async (
  fastify,
  options,
  done,
) => {
  const host = process.env.REDIS_HOST || "localhost";
  const port = parseInt(process.env.REDIS_PORT || "6379", 10);

  const messagesStackQueue = new Queue("messages-stack", {
    connection: {
      host,
      port,
    },
  });

  const messagesStackWorker = new Worker<string>(
    "messages-stack",
    async (job) => {
      const key = job.data;
      await fastify.prisma.message.createMany({
        data: (
          await fastify.cache.lrange(getMessageStackStaleKey(key), 0, -1)
        ).map((msg) => JSON.parse(msg) as Message),
      });

      fastify.cache.del(getMessageStackStaleKey(key));
    },
    {
      connection: {
        host,
        port,
      },
    },
  );

  if (!fastify.messagesStackWorker) {
    fastify.decorate("messagesStackWorker", messagesStackWorker);
    fastify.decorate("messagesStackQueue", messagesStackQueue);
  }

  done();
};

export default fp(workersConnector, { name: "fastify-bull" });

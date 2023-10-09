import fp from "fastify-plugin";

import { Worker, Queue } from "bullmq";

import type { IncomeMessage } from "@highland-cattle-chat/shared";

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
  // TODO: Move to env
  const messagesStackQueue = new Queue("messages-stack", {
    connection: {
      host: "localhost",
      port: 6379,
    },
  });

  const messagesStackWorker = new Worker<string[]>(
    "messages-stack",
    async (job) => {
      await fastify.prisma.message.createMany({
        data: job.data.map((msgStr) => {
          const msg: Required<IncomeMessage> = JSON.parse(msgStr);
          return {
            userId: msg.userId,
            content: msg.content,
            conversationId: msg.conversationId,
          };
        }),
      });
    },

    {
      connection: {
        host: "localhost",
        port: 6379,
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

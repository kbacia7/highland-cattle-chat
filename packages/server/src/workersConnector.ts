import { XXH64 } from "xxh3-ts";
import fp from "fastify-plugin";

import { Worker, Queue } from "bullmq";

import {
  MESSAGES_STACK_KEY_PREFIX,
  getMessagesStacksKeys,
} from "@routes/realTime/helpers/messagesStack";

import type { Message } from "@highland-cattle-chat/shared";
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
  const connection = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
  };

  new Queue("messages-stack-split", {
    connection,
  }).add("Split messages into jobs", null, {
    repeat: {
      pattern: "*/1 * * * *",
    },

    removeOnComplete: 1,
    removeOnFail: 1,
  });

  const messagesStackQueue = new Queue("messages-stack", {
    connection,
  });

  // eslint-disable-next-line no-new
  new Worker<null>(
    "messages-stack-split",
    async () => {
      const conversationsKeysCacheToSave = await getMessagesStacksKeys(fastify);
      await Promise.all(
        conversationsKeysCacheToSave.map(async (key) => {
          const messages: string[] = await fastify.cache.lrange(key, 0, -1);

          if (messages.length) {
            const jobData = {
              messages: messages.map((message) => JSON.parse(message)),
              key,
            };

            await messagesStackQueue.add(
              `Save messages to database (${key})`,
              jobData,
              {
                jobId: XXH64(Buffer.from(JSON.stringify(jobData))).toString(16),
                removeOnComplete: 1,
                removeOnFail: 1,
              },
            );
          }
        }),
      );

      await fastify.cache.del(MESSAGES_STACK_KEY_PREFIX);
    },
    {
      connection,
    },
  );

  const messagesStackWorker = new Worker<{
    messages: Message[];
    key: string;
  }>(
    "messages-stack",
    async (job) => {
      const { key, messages: data } = job.data;
      await fastify.prisma.message.createMany({
        data,
      });

      await fastify.cache.ltrim(key, data.length, -1);
    },
    {
      connection,
    },
  );

  if (!fastify.messagesStackWorker) {
    fastify.decorate("messagesStackWorker", messagesStackWorker);
    fastify.decorate("messagesStackQueue", messagesStackQueue);
  }

  done();
};

export default fp(workersConnector, { name: "fastify-bull" });

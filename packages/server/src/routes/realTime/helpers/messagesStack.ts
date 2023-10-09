import type { FastifyInstance } from "fastify";
import type { IncomeMessage } from "@highland-cattle-chat/shared";

type WriteMessagesStackFn = {
  (fastify: FastifyInstance): void;
};

export const addMessageToStack = (
  message: Required<IncomeMessage>,
  fastify: FastifyInstance,
) => {
  fastify.cache.rpush("messages-stack", JSON.stringify(message));
};

export const writeMessagesStack: WriteMessagesStackFn = async (fastify) => {
  fastify.messagesStackQueue.add(
    "Write messages stack",
    await fastify.cache.lrange("messages-stack", 0, -1),
  );

  fastify.cache.del("messages-stack");
};

const safeWriteMessagesStack: WriteMessagesStackFn = async (
  fastify: FastifyInstance,
) => {
  if ((await fastify.cache.llen("messages-stack")) >= 100) {
    writeMessagesStack(fastify);
  }
};

export default safeWriteMessagesStack;

import { ObjectId } from "bson";

import type { FastifyInstance } from "fastify";
import type { IncomeMessage } from "@highland-cattle-chat/shared";

export const MESSAGES_STACK_KEY_PREFIX = "messages-stack";
export const getMessageStackStaleKey = (key: string) => `stale-${key}`;
export const getMessagesStacksKeys = async (fastify: FastifyInstance) =>
  fastify.cache.keys(`${MESSAGES_STACK_KEY_PREFIX}-${fastify.serverId}*`);

export const addMessageToStack = async (
  message: Required<IncomeMessage>,
  fastify: FastifyInstance,
) => {
  const key = `${MESSAGES_STACK_KEY_PREFIX}-${fastify.serverId}-${message.conversationId}`;
  await fastify.cache.rpush(
    key,
    JSON.stringify({
      id: new ObjectId().toString(),
      createdAt: new Date(),
      content: message.content,
      attachment: message.attachment,
      conversationId: message.conversationId,
      userId: message.userId,
    }),
  );
};

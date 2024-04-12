import { ObjectId } from "bson";

import type { FastifyInstance } from "fastify";
import type { IncomeMessage } from "@highland-cattle-chat/shared";

export const MESSAGES_STACK_KEY_PREFIX = "messages-stack";
export const getMessagesStackPrefix = (serverId: string) =>
  `${MESSAGES_STACK_KEY_PREFIX}-${serverId}`;

export const addMessageToStack = async (
  message: Required<IncomeMessage>,
  fastify: FastifyInstance,
) => {
  const key = `${getMessagesStackPrefix(fastify.serverId)}-${
    message.conversationId
  }`;

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

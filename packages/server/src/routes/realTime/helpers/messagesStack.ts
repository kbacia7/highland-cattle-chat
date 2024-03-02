import { ObjectId } from "bson";

import type { FastifyInstance } from "fastify";
import type { IncomeMessage } from "@highland-cattle-chat/shared";

export const MESSAGES_STACK_KEY_PREFIX = "messages-stack";
export const getMessageStackStaleKey = (key: string) => `stale-${key}`;
export const getMessagesStacksKeys = async (fastify: FastifyInstance) =>
  fastify.cache.keys(`${MESSAGES_STACK_KEY_PREFIX}-*`);

export const getLenMessagesToWrite = async (fastify: FastifyInstance) =>
  (
    await Promise.all(
      (
        await getMessagesStacksKeys(fastify)
      ).map((key) => fastify.cache.llen(key)),
    )
  ).reduce((previous, current) => previous + current, 0);

export const addMessageToStack = async (
  message: Required<IncomeMessage>,
  fastify: FastifyInstance,
) => {
  const key = `${MESSAGES_STACK_KEY_PREFIX}-${message.conversationId}`;
  if (!(await fastify.cache.exists(getMessageStackStaleKey(key)))) {
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
  }
};

export const writeMessagesStack = async (fastify: FastifyInstance) => {
  const keys = await getMessagesStacksKeys(fastify);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    // eslint-disable-next-line no-await-in-loop
    if (!(await fastify.cache.exists(getMessageStackStaleKey(key)))) {
      // eslint-disable-next-line no-await-in-loop
      await fastify.cache.renamenx(key, getMessageStackStaleKey(key));
      fastify.messagesStackQueue.add(`Write messages stack (${key})`, key);
    }
  }
};

const safeWriteMessagesStack = async (fastify: FastifyInstance) => {
  if ((await getLenMessagesToWrite(fastify)) >= 100) {
    await writeMessagesStack(fastify);
  }
};

export default safeWriteMessagesStack;

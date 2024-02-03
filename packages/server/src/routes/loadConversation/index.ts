import { MESSAGES_STACK_KEY_PREFIX } from "@routes/realTime/helpers/messagesStack";

import type { Message } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import type { LoadConversationResponse } from "@highland-cattle-chat/shared";

const queryStringJsonSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string" },
    limit: { type: "number", default: 100 },
  },
};

const loadConversationRoute = async (fastify: FastifyInstance) => {
  fastify.get<{
    Querystring: { id: string; limit: number };
  }>(
    "/load-conversation",
    {
      logLevel: "debug",
      schema: {
        querystring: queryStringJsonSchema,
      },
    },
    async (req, reply) => {
      const user = await fastify.prisma.user.findUnique({
        where: {
          id: req.loggedUserId,
        },
      });

      if (!user) return reply.send(400);

      const incomeMessagesAsJson = await fastify.cache.lrange(
        `${MESSAGES_STACK_KEY_PREFIX}-${req.query.id}`,
        0,
        -1,
      );

      const { limit } = req.query;
      const restLimit = limit - incomeMessagesAsJson.length;
      const conversation = await fastify.prisma.conversation.findUnique({
        where: {
          participants: {
            some: {
              userId: user.id,
            },
          },
          id: req.query.id,
        },
        select: {
          ...(restLimit > 0
            ? {
                messages: {
                  select: {
                    id: true,
                    userId: true,
                    createdAt: true,
                    content: true,
                  },
                  take: restLimit,
                },
              }
            : {}),
          participants: {
            select: {
              user: {
                select: {
                  id: true,
                  displayName: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      if (!conversation) return reply.code(403).send();

      return {
        messages: (conversation?.messages || []).concat(
          incomeMessagesAsJson.map(
            (incomeMesage) => JSON.parse(incomeMesage) as Message,
          ),
        ),
        participants: conversation.participants,
      } as LoadConversationResponse;
    },
  );
};

export default loadConversationRoute;

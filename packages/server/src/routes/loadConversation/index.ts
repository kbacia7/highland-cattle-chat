import { getMessagesStackPrefix } from "@routes/realTime/helpers/messagesStack";

import type { Message } from "@prisma/client";
import type { FastifyInstance } from "fastify";

import type { LoadConversationResponse } from "@highland-cattle-chat/shared";

const queryStringJsonSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string" },
    limit: { type: "number", default: 20 },
    last: { type: "string", nullable: true },
  },
};

const loadConversationRoute = async (fastify: FastifyInstance) => {
  fastify.get<{
    Querystring: { id: string; limit: number; last: string };
  }>(
    "/load-conversation",
    {
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

      const incomeMessagesAsJson = !req.query.last
        ? await fastify.cache.lrange(
            `${getMessagesStackPrefix(fastify.serverId)}-${req.query.id}`,
            0,
            -1,
          )
        : [];

      const { limit } = req.query;
      const restLimit = limit - incomeMessagesAsJson.length;
      const count = await fastify.prisma.message.count({
        where: {
          conversationId: req.query.id,
        },
      });

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
                  ...(req.query.last && {
                    cursor: {
                      id: req.query.last,
                    },
                  }),
                  select: {
                    id: true,
                    userId: true,
                    attachment: true,
                    createdAt: true,
                    content: true,
                  },
                  orderBy: {
                    createdAt: "desc",
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
        messages: (conversation?.messages || [])
          .reverse()
          .concat(
            incomeMessagesAsJson.map(
              (incomeMesage) => JSON.parse(incomeMesage) as Message,
            ),
          ),
        count,
        participants: conversation.participants,
      } as LoadConversationResponse;
    },
  );
};

export default loadConversationRoute;

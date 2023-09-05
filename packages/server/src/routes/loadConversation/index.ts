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

      const conversation = await fastify.prisma.conversation.findUnique({
        where: {
          participants: {
            some: {
              userId: user.id,
            },
          },
          id: req.query.id,
        },
        include: {
          messages: {
            take: req.query.limit,
          },
        },
      });

      if (!conversation) return reply.code(403).send();

      return conversation.messages as LoadConversationResponse;
    },
  );
};

export default loadConversationRoute;

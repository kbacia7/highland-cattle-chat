import type { FastifyInstance } from "fastify";
import type { LoadConversationsResponse } from "@highland-cattle-chat/shared";

const loadConversationsRoute = async (fastify: FastifyInstance) => {
  fastify.get("/load-conversations", async (req) => {
    const conversations = await fastify.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: req.loggedUserId,
          },
        },
      },
      include: {
        participants: {
          select: {
            user: {
              select: {
                id: true,
                image: true,
                displayName: true,
                online: true,
              },
            },
          },
        },
      },
    });

    return conversations as LoadConversationsResponse;
  });
};

export default loadConversationsRoute;

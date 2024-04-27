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
        messages: {
          select: {
            content: true,
            userId: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    return conversations as LoadConversationsResponse;
  });
};

export default loadConversationsRoute;

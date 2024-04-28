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
          take: 1,
          where: {
            userId: {
              not: req.loggedUserId,
            },
          },
        },
        messages: {
          select: {
            content: true,
            userId: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    return conversations.sort((a, b) => {
      // NOTE: because Prisma don't support sorting by relation fields well
      const lastMessageA = a.messages[0];
      const lastMessageB = b.messages[0];

      if (lastMessageA && lastMessageB)
        return (
          lastMessageB.createdAt.valueOf() - lastMessageA.createdAt.valueOf()
        );
      return 0;
    }) as LoadConversationsResponse;
  });
};

export default loadConversationsRoute;

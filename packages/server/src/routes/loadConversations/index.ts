import type { FastifyInstance } from "fastify";

const loadConversationsRoute = async (fastify: FastifyInstance) => {
  fastify.get(
    "/load-conversations",
    { logLevel: "debug" },
    async (req, reply) => {
      const user = await fastify.prisma.user.findUnique({
        where: {
          id: req.loggedUserId,
        },
        include: {
          participates: {
            include: {
              conversation: true,
            },
          },
        },
      });

      if (!user) return reply.send(400);

      return user.participates.map((participate) => participate.conversation);
    },
  );
};

export default loadConversationsRoute;

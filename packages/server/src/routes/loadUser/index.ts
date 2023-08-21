import type { FastifyInstance } from "fastify";

const loadUserRoute = async (fastify: FastifyInstance) => {
  fastify.get("/load-user", { logLevel: "debug" }, async (req, reply) => {
    const user = await fastify.firestore
      .collection("users")
      .doc(req.loggedUserId)
      .get();

    if (!user.exists) return reply.send(400);

    const activeConversationsQuery = await fastify.firestore
      .collection("conversations")
      .select("image", "title")
      .where("users", "array-contains", user.ref)
      .get();

    return {
      activeConversations: activeConversationsQuery.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    };
  });
};

export default loadUserRoute;

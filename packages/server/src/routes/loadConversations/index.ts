import type { FastifyInstance } from "fastify";
import type { LoadConversationsResponse } from "@highland-cattle-chat/shared";

const loadConversationsRoute = async (fastify: FastifyInstance) => {
  fastify.get(
    "/load-conversations",
    { logLevel: "debug" },
    async (req, reply) => {
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

      return activeConversationsQuery.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as LoadConversationsResponse;
    },
  );
};

export default loadConversationsRoute;

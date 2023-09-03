import { FieldPath } from "@google-cloud/firestore";

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
      const user = await fastify.firestore
        .collection("users")
        .doc(req.loggedUserId)
        .get();

      if (!user.exists) return reply.send(400);

      const conversation = await fastify.firestore
        .collection("conversations")
        .where("users", "array-contains", user.ref)
        .where(FieldPath.documentId(), "==", req.query.id)
        .get();

      if (conversation.empty) return reply.code(403).send();

      const messages = await fastify.firestore
        .collection("messages")
        .where("conversation", "==", conversation.docs[0].ref)
        .orderBy("created")
        .limit(req.query.limit)
        .get();

      return messages.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as LoadConversationResponse;
    },
  );
};

export default loadConversationRoute;

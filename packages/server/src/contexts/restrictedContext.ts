import { verifySession } from "@helpers/sessions";

import loadConversationsRoute from "@routes/loadConversations";
import loadConversationRoute from "@routes/loadConversation";
import searchUserRoute from "@routes/searchUser";
import createConversationRoute from "@routes/createConversation";
import updateAccountRoute from "@routes/updateAccount";
import uploadAttachmentRoute from "@routes/uploadAttachment";
import realTimeRoute from "@routes/realTime";

import type { FastifyInstance } from "fastify";
import type { SessionCookie } from "@highland-cattle-chat/shared";

declare module "fastify" {
  interface FastifyRequest {
    loggedUserId: string;
  }
}

const restrictedContext = async (fastify: FastifyInstance) => {
  fastify.register(async (childContext) => {
    childContext.decorateRequest("loggedUserId", null);
    childContext.addHook("preHandler", async (req, reply) => {
      const sessionCookie = req.cookies.session;
      if (!sessionCookie) return reply.code(403).send();
      try {
        const session: SessionCookie = JSON.parse(
          fastify.unsignCookie(sessionCookie).value ?? "",
        );

        req.loggedUserId =
          (await verifySession(
            session.token,
            session.userId,
            fastify.prisma,
          )) ?? "";
      } catch (e) {
        return reply.code(403).send();
      }
      return null;
    });

    childContext.register(realTimeRoute);
    childContext.register(loadConversationsRoute);
    childContext.register(loadConversationRoute);
    childContext.register(searchUserRoute);
    childContext.register(updateAccountRoute);
    childContext.register(createConversationRoute);
    childContext.register(uploadAttachmentRoute);
  });
};

export default restrictedContext;

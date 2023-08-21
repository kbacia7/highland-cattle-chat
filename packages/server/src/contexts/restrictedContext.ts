import { verifySession } from "@helpers/sessions";

import loadUserRoute from "@routes/loadUser";

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
            fastify.firestore,
          )) ?? "";
      } catch (e) {
        return reply.code(403).send();
      }
      return null;
    });

    childContext.register(loadUserRoute);
  });
};

export default restrictedContext;

import { SESSION_AGE_IN_MS, createSession } from "@helpers/sessions";

import type { SessionCookie } from "@highland-cattle-chat/shared";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

type LoginStringRequest = FastifyRequest<{
  Body: {
    alias: string;
  };
}>;

export const setSessionCookie = (
  token: string,
  userId: string,
  reply: FastifyReply,
) => {
  const cookie: SessionCookie = {
    userId,
    token,
  };

  reply.setCookie("session", JSON.stringify(cookie), {
    signed: true,
    secure: true,
    httpOnly: true,
    maxAge: SESSION_AGE_IN_MS / 1000,
  });

  return reply;
};

const loginUserRoute = async (fastify: FastifyInstance) => {
  fastify.post(
    "/login",
    {
      logLevel: "debug",
      schema: {
        body: {
          type: "object",
          required: ["alias"],
          properties: {
            alias: { type: "string" },
          },
        },
      },
    },
    async (req: LoginStringRequest, reply) => {
      const user = await fastify.prisma.user.findUnique({
        where: {
          login: req.body.alias,
        },
      });

      if (!user) return reply.code(403).send();

      // TODO: Create new login route after remove openpgp idea

      const token = await createSession(user.id, fastify.prisma);
      return setSessionCookie(token, user.id, reply).send(user);
    },
  );
};

export default loginUserRoute;

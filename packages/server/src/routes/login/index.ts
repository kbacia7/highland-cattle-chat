import bcrypt from "bcrypt";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import { loginSchema } from "@highland-cattle-chat/shared";

import { SESSION_AGE_IN_MS, createSession } from "@helpers/sessions";

import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { FastifyInstance, FastifyReply } from "fastify";
import type {
  LoginResponse,
  SessionCookie,
} from "@highland-cattle-chat/shared";

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
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/login",
    {
      logLevel: "debug",
      schema: {
        body: loginSchema,
      },
    },
    async (req, reply) => {
      const user = await fastify.prisma.user.findUnique({
        where: {
          email: req.body.email,
        },
      });

      const isValidPassword = await bcrypt.compare(
        req.body.password,
        user?.password || "",
      );

      if (!user || !isValidPassword)
        return reply.code(403).send({ error: "Incorrect email or password" });

      const token = await createSession(user.id, fastify.prisma);
      return setSessionCookie(token, user.id, reply).send({
        ...user,
        password: undefined,
      } as LoginResponse);
    },
  );
};

export default loginUserRoute;

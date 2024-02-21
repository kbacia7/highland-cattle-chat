import bcrypt from "bcrypt";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import { registerSchema } from "@highland-cattle-chat/shared";

import sendWelcomeMessages from "@helpers/sendWelcomeMessages";

import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

const registerRoute = async (fastify: FastifyInstance) => {
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/register",
    {
      schema: {
        body: registerSchema,
      },
    },
    async (req, reply) => {
      if (req.cookies.session) {
        return reply.code(403).send();
      }

      const userExists = await fastify.prisma.user.findFirst({
        where: {
          email: req.body.email,
        },
      });

      if (userExists)
        return reply.code(403).send({
          error: "User with given e-mail already exists",
        });

      const user = await fastify.prisma.user.create({
        data: {
          displayName: req.body.displayName,
          password: await bcrypt.hash(req.body.password, 10),
          email: req.body.email,
          image: process.env.USER_PROFILE_PICTURE_PLACEHOLDER_URL || "",
        },
      });

      sendWelcomeMessages(fastify, user.id);
      return reply.send({ userId: user.id });
    },
  );
};

export default registerRoute;

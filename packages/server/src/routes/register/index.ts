import bcrypt from "bcrypt";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import { registerSchema } from "@highland-cattle-chat/shared";

import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

const registerRoute = async (fastify: FastifyInstance) => {
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/register",
    {
      logLevel: "debug",
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

      if (userExists) return reply.code(403).send();

      await fastify.prisma.user.create({
        data: {
          displayName: req.body.displayName,
          password: await bcrypt.hash(req.body.password, 10),
          email: req.body.email,
        },
      });

      return reply.send();
    },
  );
};

export default registerRoute;
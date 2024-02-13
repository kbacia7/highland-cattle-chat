import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import { createConversationSchema } from "@highland-cattle-chat/shared";

import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { FastifyInstance } from "fastify";

import type { CreateConversationResponse } from "@highland-cattle-chat/shared";

const createConversationRoute = async (fastify: FastifyInstance) => {
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/create-conversation",
    {
      logLevel: "debug",
      schema: {
        body: createConversationSchema,
      },
    },
    async (req, reply) => {
      let user;
      try {
        user = await fastify.prisma.user.findUnique({
          where: {
            id: req.body.id,
          },
        });
      } catch (e) {
        return reply.code(400).send();
      }

      const oldConversation = await fastify.prisma.conversation.findFirst({
        where: {
          AND: [
            {
              participants: {
                some: {
                  userId: req.body.id,
                },
              },
            },
            {
              participants: {
                some: {
                  userId: req.loggedUserId,
                },
              },
            },
          ],
        },
      });

      if (!user || oldConversation || req.body.id === req.loggedUserId)
        return reply.code(400).send();

      const conversation = await fastify.prisma.conversation.create({
        select: {
          id: true,
        },
        data: {
          title: user.displayName,
          participants: {
            create: [{ userId: user.id }, { userId: req.loggedUserId }],
          },
        },
      });

      return conversation as CreateConversationResponse;
    },
  );
};

export default createConversationRoute;

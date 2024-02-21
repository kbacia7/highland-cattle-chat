import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import { searchUserSchema } from "@highland-cattle-chat/shared";

import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { SearchUserResponse } from "@highland-cattle-chat/shared";

const searchUserRoute = async (fastify: FastifyInstance) => {
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/search-user",
    {
      schema: {
        querystring: searchUserSchema,
      },
    },
    async (req) => {
      const users = await fastify.prisma.user.findMany({
        select: {
          id: true,
          image: true,
          displayName: true,
        },
        where: {
          displayName: {
            contains: req.query.phrase,
          },
          id: {
            not: req.loggedUserId,
          },
          participates: {
            none: {
              conversation: {
                participants: {
                  some: {
                    userId: req.loggedUserId,
                  },
                },
              },
            },
          },
        },
      });

      return users as SearchUserResponse;
    },
  );
};

export default searchUserRoute;

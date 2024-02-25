import fp from "fastify-plugin";

import type { User } from "@prisma/client";

import type { FastifyPluginCallback } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    guideUser: User;
  }
}

const findGuideUser: FastifyPluginCallback = async (fastify) => {
  const guideUser = await fastify.prisma.user.findFirst({
    where: {
      displayName: "Mrs. Guide",
    },
  });

  if (!guideUser) {
    throw new Error("Guide user not found");
  }

  if (!fastify.hasDecorator("guideUser"))
    fastify.decorate("guideUser", guideUser);
};

export default fp(findGuideUser, {
  name: "findGuideUser",
});

import fp from "fastify-plugin";

import type { User } from "@prisma/client";

import type { FastifyPluginCallback } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    guideUser: User;
  }
}

const createGuideUser: FastifyPluginCallback = async (
  fastify,
  options,
  done,
) => {
  let guideUser = await fastify.prisma.user.findFirst({
    where: {
      displayName: "Mrs. Guide",
    },
  });

  if (!guideUser) {
    guideUser = await fastify.prisma.user.create({
      data: {
        displayName: "Mrs. Guide",
        email: "fake-incorrect-email",
        password: "fake-incorrect-password",
      },
    });
  }

  if (!fastify.hasDecorator("guideUser"))
    fastify.decorate("guideUser", guideUser);
  done();
};

export default fp(createGuideUser, {
  name: "createGuideUser",
});

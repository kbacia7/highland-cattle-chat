import type { FastifyInstance } from "fastify";

export const testUsersCredientials = {
  JOHN: {
    email: "john@example.com",
    password: "password-john",
  },
  MIKE: {
    email: "mike@example.com",
    password: "password-mike",
  },
  ZAPP: {
    email: "zapp@example.com",
    password: "password-zapp",
  },
};

export const loadTestUserFromDB = async (
  testUserName: keyof typeof testUsersCredientials,
  fastify: FastifyInstance,
) =>
  fastify.prisma.user.findFirstOrThrow({
    where: {
      email: testUsersCredientials[testUserName].email,
    },
  });

const authorize = async (
  testUserName: keyof typeof testUsersCredientials,
  fastify: FastifyInstance,
) => {
  const response = await fastify.inject({
    method: "POST",
    url: "/login",
    body: testUsersCredientials[testUserName],
  });

  return `session=${
    response.cookies.find(({ name }) => name === "session")?.value
  };`;
};

export default authorize;

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

const authorize = async (
  fakeUserName: keyof typeof testUsersCredientials,
  fastify: FastifyInstance,
) => {
  const response = await fastify.inject({
    method: "POST",
    url: "/login",
    body: testUsersCredientials[fakeUserName],
  });

  return `session=${
    response.cookies.find(({ name }) => name === "session")?.value
  };`;
};

export default authorize;

import type { FastifyInstance } from "fastify";

const authorize = async (
  email: string,
  password: string,
  fastify: FastifyInstance,
) => {
  const response = await fastify.inject({
    method: "POST",
    url: "/login",
    body: {
      email,
      password,
    },
  });

  return `session=${
    response.cookies.find(({ name }) => name === "session")?.value
  };`;
};

export default authorize;

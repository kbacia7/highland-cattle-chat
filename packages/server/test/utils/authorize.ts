import type { FastifyInstance } from "fastify";

const authorize = async (alias: string, fastify: FastifyInstance) => {
  const response = await fastify.inject({
    method: "POST",
    url: "/login",
    body: {
      alias,
    },
  });

  return `session=${
    response.cookies.find(({ name }) => name === "session")?.value
  };`;
};

export default authorize;

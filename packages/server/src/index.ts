import Fastify, { type FastifyInstance } from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import realTimeRoute from "./routes/realTime";

const LOGGER_OPTIONS = {
  development: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  production: true,
  test: false,
};

const fastify: FastifyInstance = Fastify({
  logger: LOGGER_OPTIONS[process.env.NODE_ENV],
});

fastify.register(fastifyWebsocket);
fastify.register(realTimeRoute);

const start = async (): Promise<void> => {
  try {
    await fastify.listen({
      port: parseInt(process.env.PORT ?? "3000", 10),
      host: "0.0.0.0",
    });
    const address = fastify.server.address();
    const port = typeof address === "string" ? address : address?.port;
    fastify.log.info(`Server is running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

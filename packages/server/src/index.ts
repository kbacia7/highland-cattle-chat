import fs from "fs";
import path from "path";

import build from "./app";

const LOGGER_OPTIONS = {
  development: {
    level: "debug",
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

const fastify = await build({
  logger: LOGGER_OPTIONS[process.env.NODE_ENV],
  https: {
    key: fs.readFileSync(path.join("./https", "localhost-key.pem")),
    cert: fs.readFileSync(path.join("./https", "localhost.pem")),
  },
});

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

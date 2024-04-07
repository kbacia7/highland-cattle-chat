import fs from "fs";

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
  ...(process.env.HTTPS_KEY_PATH && process.env.HTTPS_CERT_PATH
    ? {
        https: {
          key: fs.readFileSync(process.env.HTTPS_KEY_PATH),
          cert: fs.readFileSync(process.env.HTTPS_CERT_PATH),
        },
      }
    : {}),
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

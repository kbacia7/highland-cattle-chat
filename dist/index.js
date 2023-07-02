// src/index.ts
import Fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";

// src/messages.ts
var convertRawMessage = (message) => {
  try {
    return JSON.parse(message);
  } catch (e) {
    return null;
  }
};
var connectedClients = {};
var handleMessage = (rawMessage, socket) => {
  const message = convertRawMessage(rawMessage);
  if (message == null) {
    return;
  }
  switch (message.type) {
    case "init": {
      connectedClients[message.senderPublicKey] = { socket };
      const response = {
        senderPublicKey: "SERVER",
        recipientPublicKey: message.senderPublicKey,
        content: "OK",
        type: "init"
      };
      socket.send(JSON.stringify(response));
      break;
    }
    case "text": {
      const { socket: recipientSocket } = connectedClients?.[message.recipientPublicKey || ""];
      recipientSocket?.send(JSON.stringify(message));
      break;
    }
  }
};

// src/routes/realTime.ts
var realTimeRoute = async (fastify2) => {
  fastify2.get(
    "/real-time",
    { websocket: true, logLevel: "debug" },
    (connection, req) => {
      connection.socket.on("message", (data, isBinary) => {
        handleMessage(data.toString(), connection.socket);
      });
    }
  );
};
var realTime_default = realTimeRoute;

// src/index.ts
var LOGGER_OPTIONS = {
  development: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname"
      }
    }
  },
  production: true,
  test: false
};
var fastify = Fastify({
  logger: LOGGER_OPTIONS[process.env.NODE_ENV ?? "development"]
});
fastify.register(fastifyWebsocket);
fastify.register(realTime_default);
var start = async () => {
  try {
    await fastify.listen({
      port: parseInt(process.env.PORT ?? "3000"),
      host: "0.0.0.0"
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

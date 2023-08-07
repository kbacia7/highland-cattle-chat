// src/index.ts
import Fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";

// src/routes/realTime/index.ts
import { WebSocket } from "ws";

// src/routes/realTime/helpers/convertRawMessage.ts
var convertRawMessage = (message) => {
  try {
    return JSON.parse(message);
  } catch (e) {
    return void 0;
  }
};
var convertRawMessage_default = convertRawMessage;

// src/routes/realTime/helpers/validateIncomeMessage.ts
import Ajv from "ajv";
import fastUri from "fast-uri";
var ajv = new Ajv({
  coerceTypes: "array",
  useDefaults: true,
  removeAdditional: true,
  uriResolver: fastUri,
  addUsedSchema: false,
  allErrors: false
});
var incomeMessageSchema = {
  type: "object",
  $id: "/schemas/incoming-message.json",
  properties: {
    type: { type: "string" },
    senderPublicKey: { type: "string" },
    recipientPublicKey: { type: "string", nullable: true },
    content: { type: "string", nullable: true }
  },
  required: ["senderPublicKey", "type"]
};
var validateIncomeMessage = ajv.compile(incomeMessageSchema);
var validateIncomeMessage_default = validateIncomeMessage;

// src/routes/realTime/consts.ts
var SERVER_PUBLIC_KEY = `-----BEGIN PGP PUBLIC KEY BLOCK-----

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
=U8YM
-----END PGP PUBLIC KEY BLOCK-----
`;
var MessageTypes = {
  INIT: "INIT",
  TEXT: "TEXT",
  UNKNOWN_ERROR: "UNKNOWN_ERROR"
};
var MessageStatuses = {
  OK: "OK",
  ERROR: "ERROR"
};

// src/routes/realTime/helpers/extrackKeyId.ts
import * as openpgp from "openpgp";
var extractKeyId = async (armoredKey) => {
  try {
    return (await openpgp.readKey({
      armoredKey
    })).getKeyID().toHex();
  } catch (e) {
    return void 0;
  }
};
var extrackKeyId_default = extractKeyId;

// src/routes/realTime/helpers/escapeHtml.ts
var escapeHtml = (unsafe) => unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
var escapeHtml_default = escapeHtml;

// src/routes/realTime/index.ts
var connectedClients = {};
var getActiveSocketByKeyId = (keyId) => keyId && connectedClients[keyId] && connectedClients[keyId].socket.readyState === WebSocket.OPEN ? connectedClients[keyId].socket : void 0;
var respondWithUnknownError = (socket) => {
  const response = {
    senderPublicKey: SERVER_PUBLIC_KEY,
    type: MessageTypes.UNKNOWN_ERROR,
    status: MessageStatuses.ERROR
  };
  socket.send(JSON.stringify(response));
};
var handleMessage = async (rawMessage, socket) => {
  const message = convertRawMessage_default(rawMessage);
  if (!validateIncomeMessage_default(message)) {
    respondWithUnknownError(socket);
    return;
  }
  const senderKeyId = await extrackKeyId_default(message.senderPublicKey);
  if (!senderKeyId) {
    respondWithUnknownError(socket);
    return;
  }
  switch (message.type) {
    case MessageTypes.INIT: {
      if (getActiveSocketByKeyId(senderKeyId)) {
        const response2 = {
          type: MessageTypes.INIT,
          senderPublicKey: SERVER_PUBLIC_KEY,
          recipientPublicKey: message.senderPublicKey,
          status: MessageStatuses.ERROR
        };
        socket.send(JSON.stringify(response2));
        return;
      }
      connectedClients[senderKeyId] = {
        socket,
        armoredKey: message.senderPublicKey
      };
      const response = {
        senderPublicKey: SERVER_PUBLIC_KEY,
        recipientPublicKey: message.senderPublicKey,
        type: MessageTypes.INIT,
        status: MessageStatuses.OK
      };
      socket.send(JSON.stringify(response));
      break;
    }
    case MessageTypes.TEXT: {
      if (!message.content || !message.recipientPublicKey) {
        const response = {
          type: MessageTypes.TEXT,
          senderPublicKey: SERVER_PUBLIC_KEY,
          recipientPublicKey: message.senderPublicKey,
          status: MessageStatuses.ERROR
        };
        socket.send(JSON.stringify(response));
        return;
      }
      message.content = escapeHtml_default(message.content);
      const outcomeMessage = JSON.stringify({
        ...message,
        status: MessageStatuses.OK
      });
      const recipientKeyId = await extrackKeyId_default(message.recipientPublicKey);
      const recipientSocket = getActiveSocketByKeyId(recipientKeyId);
      if (recipientSocket) {
        recipientSocket.send(outcomeMessage);
      }
      const senderSocket = getActiveSocketByKeyId(senderKeyId);
      if (senderSocket) {
        senderSocket.send(outcomeMessage);
      }
      break;
    }
    default: {
      respondWithUnknownError(socket);
      break;
    }
  }
};
var realTimeRoute = async (fastify2) => {
  fastify2.get(
    "/real-time",
    { websocket: true, logLevel: "debug" },
    (connection) => {
      connection.socket.on("message", (data) => {
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
  logger: LOGGER_OPTIONS[process.env.NODE_ENV]
});
fastify.register(fastifyWebsocket);
fastify.register(realTime_default);
var start = async () => {
  try {
    await fastify.listen({
      port: parseInt(process.env.PORT ?? "3000", 10),
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

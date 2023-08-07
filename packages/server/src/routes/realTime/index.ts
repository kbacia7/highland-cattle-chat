import type { FastifyInstance } from "fastify";
import { WebSocket } from "ws";

import { MessageStatuses, MessageTypes, SERVER_PUBLIC_KEY } from "@highland-cattle-chat/shared";
import type { OutcomeMessage } from "@highland-cattle-chat/shared";

import convertRawMessage from "./helpers/convertRawMessage";
import validateIncomeMessage from "./helpers/validateIncomeMessage";
import extractKeyId from "./helpers/extrackKeyId";
import escapeHtml from "./helpers/escapeHtml";

type ConnectedClients = Record<
  string,
  {
    socket: WebSocket;
    armoredKey: string;
  }
>;

const connectedClients: ConnectedClients = {};

const getActiveSocketByKeyId = (keyId?: string) =>
  keyId &&
  connectedClients[keyId] &&
  connectedClients[keyId].socket.readyState === WebSocket.OPEN
    ? connectedClients[keyId].socket
    : undefined;

const respondWithUnknownError = (socket: WebSocket) => {
  const response: OutcomeMessage = {
    senderPublicKey: SERVER_PUBLIC_KEY,
    type: MessageTypes.UNKNOWN_ERROR,
    status: MessageStatuses.ERROR,
  };

  socket.send(JSON.stringify(response));
};

const handleMessage = async (
  rawMessage: string,
  socket: WebSocket,
): Promise<void> => {
  const message = convertRawMessage(rawMessage);
  if (!validateIncomeMessage(message)) {
    respondWithUnknownError(socket);
    return;
  }

  const senderKeyId = await extractKeyId(message.senderPublicKey);
  if (!senderKeyId) {
    respondWithUnknownError(socket);
    return;
  }

  switch (message.type) {
    case MessageTypes.INIT: {
      if (getActiveSocketByKeyId(senderKeyId)) {
        const response: OutcomeMessage = {
          type: MessageTypes.INIT,
          senderPublicKey: SERVER_PUBLIC_KEY,
          recipientPublicKey: message.senderPublicKey,
          status: MessageStatuses.ERROR,
        };

        socket.send(JSON.stringify(response));
        return;
      }

      connectedClients[senderKeyId] = {
        socket,
        armoredKey: message.senderPublicKey,
      };

      const response: OutcomeMessage = {
        senderPublicKey: SERVER_PUBLIC_KEY,
        recipientPublicKey: message.senderPublicKey,
        type: MessageTypes.INIT,
        status: MessageStatuses.OK,
      };

      socket.send(JSON.stringify(response));
      break;
    }

    case MessageTypes.TEXT: {
      if (!message.content || !message.recipientPublicKey) {
        const response: OutcomeMessage = {
          type: MessageTypes.TEXT,
          senderPublicKey: SERVER_PUBLIC_KEY,
          recipientPublicKey: message.senderPublicKey,
          status: MessageStatuses.ERROR,
        };

        socket.send(JSON.stringify(response));
        return;
      }

      message.content = escapeHtml(message.content);
      const outcomeMessage = JSON.stringify({
        ...message,
        status: MessageStatuses.OK,
      });

      const recipientKeyId = await extractKeyId(message.recipientPublicKey);
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

const realTimeRoute = async (fastify: FastifyInstance) => {
  fastify.get(
    "/real-time",
    { websocket: true, logLevel: "debug" },
    (connection) => {
      connection.socket.on("message", (data) => {
        handleMessage(data.toString(), connection.socket);
      });
    },
  );
};

export default realTimeRoute;

import { WebSocket } from "ws";

import {
  MessageStatuses,
  MessageTypes,
  SERVER_USER_ID,
} from "@highland-cattle-chat/shared";

import convertRawMessage from "./helpers/convertRawMessage";
import validateIncomeMessage from "./helpers/validateIncomeMessage";
import escapeHtml from "./helpers/escapeHtml";

import type { OutcomeMessage } from "@highland-cattle-chat/shared";
import type { FastifyInstance } from "fastify";

type ConnectedClients = Record<
  string,
  {
    socket: WebSocket;
  }
>;

const connectedClients: ConnectedClients = {};

const getActiveSocketByUserId = (userId?: string) =>
  userId &&
  connectedClients[userId] &&
  connectedClients[userId].socket.readyState === WebSocket.OPEN
    ? connectedClients[userId].socket
    : undefined;

const respondWithUnknownError = (socket: WebSocket) => {
  const response: OutcomeMessage = {
    senderUserId: SERVER_USER_ID,
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

  switch (message.type) {
    case MessageTypes.INIT: {
      if (getActiveSocketByUserId(message.senderUserId)) {
        const response: OutcomeMessage = {
          type: MessageTypes.INIT,
          senderUserId: SERVER_USER_ID,
          recipientUserId: message.senderUserId,
          status: MessageStatuses.ERROR,
        };

        socket.send(JSON.stringify(response));
        return;
      }

      connectedClients[message.senderUserId] = {
        socket,
      };

      const response: OutcomeMessage = {
        senderUserId: SERVER_USER_ID,
        recipientUserId: message.senderUserId,
        type: MessageTypes.INIT,
        status: MessageStatuses.OK,
      };

      socket.send(JSON.stringify(response));
      break;
    }

    case MessageTypes.TEXT: {
      if (!message.content || !message.recipientUserId) {
        const response: OutcomeMessage = {
          type: MessageTypes.TEXT,
          senderUserId: SERVER_USER_ID,
          recipientUserId: message.senderUserId,
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

      const recipientSocket = getActiveSocketByUserId(message.recipientUserId);
      if (recipientSocket) {
        recipientSocket.send(outcomeMessage);
      }

      const senderSocket = getActiveSocketByUserId(message.senderUserId);
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

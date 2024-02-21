import { WebSocket } from "ws";

import {
  MessageStatuses,
  MessageTypes,
  SERVER_USER_ID,
} from "@highland-cattle-chat/shared";

import convertRawMessage from "./helpers/convertRawMessage";
import validateIncomeMessage from "./helpers/validateIncomeMessage";
import escapeHtml from "./helpers/escapeHtml";

import safeWriteMessagesStack, {
  addMessageToStack,
} from "./helpers/messagesStack";

import type {
  IncomeMessage,
  MessageType,
  OutcomeMessage,
} from "@highland-cattle-chat/shared";
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

const respondWithError = (type: MessageType, socket: WebSocket) => {
  const response: OutcomeMessage = {
    userId: SERVER_USER_ID,
    type,
    status: MessageStatuses.ERROR,
  };

  socket.send(JSON.stringify(response));
};

const handleMessage = async (
  rawMessage: string,
  socket: WebSocket,
  fastify: FastifyInstance,
): Promise<void> => {
  const message = convertRawMessage(rawMessage);
  if (!validateIncomeMessage(message)) {
    respondWithError(MessageTypes.UNKNOWN_ERROR, socket);
    return;
  }

  switch (message.type) {
    case MessageTypes.INIT: {
      if (getActiveSocketByUserId(message.userId)) {
        const response: OutcomeMessage = {
          type: MessageTypes.INIT,
          userId: SERVER_USER_ID,
          status: MessageStatuses.ERROR,
        };

        socket.send(JSON.stringify(response));
        return;
      }

      connectedClients[message.userId] = {
        socket,
      };

      const response: OutcomeMessage = {
        userId: SERVER_USER_ID,
        type: MessageTypes.INIT,
        status: MessageStatuses.OK,
      };

      socket.send(JSON.stringify(response));
      break;
    }

    case MessageTypes.TEXT: {
      if (!message.content || !message.conversationId) {
        respondWithError(MessageTypes.TEXT, socket);
        return;
      }

      // TODO: Check with .explain() how effency it's
      const conversation = await fastify.prisma.conversation.findUnique({
        where: {
          id: message.conversationId,
          participants: {
            some: {
              userId: message.userId,
            },
          },
        },
        cache: {
          ttl: 86400,
        },
        include: {
          participants: {
            select: {
              userId: true,
            },
          },
        },
      });

      if (!conversation) {
        respondWithError(MessageTypes.TEXT, socket);
        return;
      }

      message.content = escapeHtml(message.content);
      const outcomeMessage = JSON.stringify({
        ...message,
        status: MessageStatuses.OK,
      });

      conversation?.participants.forEach(({ userId }) => {
        const recipientSocket = getActiveSocketByUserId(userId);
        if (recipientSocket) {
          recipientSocket.send(outcomeMessage);
        }
      });

      await addMessageToStack(message as Required<IncomeMessage>, fastify);
      await safeWriteMessagesStack(fastify);
      break;
    }

    default: {
      respondWithError(MessageTypes.UNKNOWN_ERROR, socket);
      break;
    }
  }
};

const realTimeRoute = async (fastify: FastifyInstance) => {
  fastify.get("/real-time", { websocket: true }, (connection) => {
    connection.socket.on("message", (data) => {
      handleMessage(data.toString(), connection.socket, fastify);
    });
  });
};

export default realTimeRoute;

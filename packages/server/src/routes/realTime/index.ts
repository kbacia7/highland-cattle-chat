import path from "path";

import { WebSocket } from "ws";

import {
  MessageStatuses,
  MessageTypes,
  SERVER_USER_ID,
} from "@highland-cattle-chat/shared";

import createChannelMessage from "@helpers/createChannelMessage";

import convertRawMessage from "./helpers/convertRawMessage";
import validateIncomeMessage from "./helpers/validateIncomeMessage";
import escapeHtml from "./helpers/escapeHtml";

import { addMessageToStack } from "./helpers/messagesStack";

import type { ChannelMessage } from "@helpers/createChannelMessage";

import type {
  IncomeMessage,
  MessageType,
  OutcomeMessage,
} from "@highland-cattle-chat/shared";
import type { FastifyInstance } from "fastify";

const REDIS_MESSAGES_CHANNEL_NAME = "messages";

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
  rawMessage: string | IncomeMessage,
  messageFromChannel: boolean,
  socket: WebSocket,
  fastify: FastifyInstance,
): Promise<void> => {
  const message =
    typeof rawMessage === "string" ? convertRawMessage(rawMessage) : rawMessage;

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
      if (
        (!message.content && !message.attachment) ||
        !message.conversationId
      ) {
        respondWithError(MessageTypes.TEXT, socket);
        return;
      }

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

      if (message.attachment?.length && message.attachment.length < 20) {
        const filename = message.attachment.replace(
          path.basename(message.attachment),
          "",
        );

        if (filename.match(/[^A-Za-z0-9_-]/)) {
          respondWithError(MessageTypes.TEXT, socket);
          return;
        }
      }

      if (message.content) message.content = escapeHtml(message.content);
      const outcomeMessage = JSON.stringify({
        ...message,
        status: MessageStatuses.OK,
      });

      conversation?.participants.forEach(({ userId }) => {
        const recipientSocket = getActiveSocketByUserId(userId);
        if (recipientSocket) {
          recipientSocket.send(outcomeMessage);
        } else if (!messageFromChannel) {
          fastify.pubRedis.publish(
            REDIS_MESSAGES_CHANNEL_NAME,
            createChannelMessage(fastify.serverId, message),
          );
        }
      });

      await addMessageToStack(message as Required<IncomeMessage>, fastify);
      break;
    }

    default: {
      respondWithError(MessageTypes.UNKNOWN_ERROR, socket);
      break;
    }
  }
};

const realTimeRoute = async (fastify: FastifyInstance) => {
  fastify.addHook("onReady", () => {
    fastify.subRedis.subscribe(REDIS_MESSAGES_CHANNEL_NAME);
    fastify.subRedis.on("message", (channel: string, rawMessage: string) => {
      if (channel === REDIS_MESSAGES_CHANNEL_NAME) {
        const channelMessage: ChannelMessage = JSON.parse(rawMessage);
        if (channelMessage.serverId !== fastify.serverId) {
          const message = convertRawMessage(channelMessage.data);
          if (message) {
            const recipientSocket = getActiveSocketByUserId(message.userId);
            if (recipientSocket)
              handleMessage(message, true, recipientSocket, fastify);
          }
        }
      }
    });
  });

  fastify.get("/real-time", { websocket: true }, (connection) => {
    connection.socket.on("message", (data) => {
      handleMessage(data.toString(), false, connection.socket, fastify);
    });
  });
};

export default realTimeRoute;

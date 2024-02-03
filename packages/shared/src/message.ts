import { Prisma } from "@prisma/client";
export {
  type Message,
  type User,
  type Conversation,
  type ConversationParticipant,
} from "@prisma/client";

export const SERVER_USER_ID = `SERVER`;

export const MessageTypes = {
  INIT: "INIT",
  TEXT: "TEXT",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export const MessageStatuses = {
  OK: "OK",
  ERROR: "ERROR",
} as const;

export type MessageType = (typeof MessageTypes)[keyof typeof MessageTypes];
export type MessageStatus =
  (typeof MessageStatuses)[keyof typeof MessageStatuses];
export type IncomeMessage = {
  type: MessageType;
  content?: string;
  userId: string;
  conversationId?: string;
};

export interface OutcomeMessage extends IncomeMessage {
  status: MessageStatus;
}

export type LoadConversationResponse = {
  messages: Prisma.MessageGetPayload<{
    select: {
      id: true;
      userId: true;
      createdAt: true;
      content: true;
    };
  }>[];
  participants: Prisma.ConversationParticipantGetPayload<{
    select: {
      user: {
        select: {
          id: true;
          displayName: true;
          image: true;
        };
      };
    };
  }>[];
};

export type LoadConversationsResponse = Prisma.ConversationGetPayload<{
  include: {
    participants: {
      select: {
        user: {
          select: {
            id: true;
            image: true;
          };
        };
      };
    };
  };
}>[];

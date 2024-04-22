import { Prisma } from "@prisma/client";
import { User } from "@prisma/client";

export {
  type Message,
  type User,
  type Conversation,
  type ConversationParticipant,
} from "@prisma/client";

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
  attachment?: string;
  conversationId?: string;
};

export interface OutcomeMessage extends IncomeMessage {
  status: MessageStatus;
  userId?: string;
}

export type LoadConversationResponse = {
  messages: Prisma.MessageGetPayload<{
    select: {
      id: true;
      attachment: true;
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
  count: number;
};

export type LoadConversationsResponse = Prisma.ConversationGetPayload<{
  include: {
    participants: {
      select: {
        user: {
          select: {
            id: true;
            image: true;
            displayName: true;
            online: true;
          };
        };
      };
    };
  };
}>[];

export type SearchUserResponse = Prisma.UserGetPayload<{
  select: {
    id: true;
    image: true;
    displayName: true;
  };
}>[];

export type CreateConversationResponse = Prisma.ConversationGetPayload<{
  select: {
    id: true;
  };
}>;

export type RegisterResponse = {
  userId?: string;
  error?: string;
};

export type LoginResponse = Omit<User, "password">;
export type UpdateAccountResponse = Omit<User, "password">;
export type UploadAttachmentResponse = {
  attachment: string;
};

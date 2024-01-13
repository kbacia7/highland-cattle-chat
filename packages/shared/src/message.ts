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

export type MessageRecord = {
  id: string;
  content: string;
  userId: string;
  conversationId: string;
  createdAt: Date;
};

export type UserRecord = {
  id?: string;
  displayName: string;
  email: string;
  createdAt?: string;
};

export type ConversationRecord = {
  id: string;
  title: string;
  image: string;
  createdAt?: string;
};

export type ConversationParticipant<T = UserRecord> = {
  id?: string;
  userId: string;
  conversationId: string;
  createdAt?: string;
  user: T;
};

export type LoadConversationResponse = {
  messages: Pick<
    Required<MessageRecord>,
    "id" | "createdAt" | "content" | "userId"
  >[];
  participants: Pick<
    Required<ConversationParticipant<Pick<UserRecord, "displayName" | "id">>>,
    "user"
  >[];
  image: string;
};

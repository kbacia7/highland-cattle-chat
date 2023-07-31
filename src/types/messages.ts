import type { MessageStatuses, MessageTypes } from "@routes/realTime/consts";

export type MessageType = (typeof MessageTypes)[keyof typeof MessageTypes];
export type MessageStatus =
  (typeof MessageStatuses)[keyof typeof MessageStatuses];
export type IncomeMessage = {
  type: MessageType;
  senderPublicKey: string;
  recipientPublicKey?: string;
  content?: string;
};

export interface OutcomeMessage extends IncomeMessage {
  status: MessageStatus;
}

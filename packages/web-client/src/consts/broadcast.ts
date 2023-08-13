export const InternalMessageTypes = {
  READY: "READY",
} as const;

export type InternalMessageType =
  (typeof InternalMessageTypes)[keyof typeof InternalMessageTypes];

export type InternalMessage = {
  type: InternalMessageType;
  content: string;
};

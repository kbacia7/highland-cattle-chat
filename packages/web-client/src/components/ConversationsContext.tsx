import { createContextId } from "@builder.io/qwik";

type Conversations = {
  [id: string]: string;
};

export const ConversationsContext = createContextId<Conversations>(
  "coversations-context",
);

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useParams } from "react-router-dom";

import { MessageTypes } from "@highland-cattle-chat/shared";

import Chat from "~/components/Chat";
import ConversationHeader from "~/components/ConversationHeader";
import Input from "~/components/Input";
import { InternalMessageTypes } from "~/consts/broadcast";
import { useLoadConversationQuery } from "~/slices/conversationsSlice";
import { useAppSelector } from "~/slices/hooks";

import SendMessageIcon from "~/components/icons/Send";

import type {
  IncomeMessage,
  LoadConversationResponse,
  OutcomeMessage,
} from "@highland-cattle-chat/shared";

const transformOutcomeMessage = (message: OutcomeMessage) => {
  const messageRecord: LoadConversationResponse["messages"][0] = {
    content: message.content ?? "",
    createdAt: new Date(),
    id: uuidv4(),
    userId: message.userId,
  };
  return messageRecord;
};

const ConversationRoute = () => {
  const { id: conversationId } = useParams();
  const { userId } = useAppSelector((state) => state.loggedUser);
  const { currentData, isLoading } = useLoadConversationQuery({
    id: conversationId ?? "",
  });

  const [messages, setMessages] = useState<
    LoadConversationResponse["messages"]
  >([]);

  useEffect(() => {
    if (!isLoading) {
      const internalChannel = new BroadcastChannel("internal_messages");
      internalChannel.postMessage({
        type: InternalMessageTypes.READY,
      });
    }
  }, [isLoading]);

  useEffect(() => {
    const channel = new BroadcastChannel("received_messages");
    channel.addEventListener("message", (event) => {
      const message: OutcomeMessage | OutcomeMessage[] = event.data;
      if (Array.isArray(message)) {
        setMessages((value) => [
          ...value,
          ...message
            .filter((m) => m.type === MessageTypes.TEXT)
            .map((msg) => transformOutcomeMessage(msg)),
        ]);
      } else {
        if (message.type === MessageTypes.TEXT)
          setMessages((value) => [...value, transformOutcomeMessage(message)]);
      }
    });

    return () => channel.close();
  }, []);

  useEffect(() => {
    setMessages(currentData?.messages ?? []);
  }, [currentData]);

  if (!currentData?.messages) return null; //TODO: Error and loading handle

  return (
    <main className="w-full">
      <div className="flex flex-col h-full">
        <ConversationHeader
          image={currentData.image}
          participant={currentData.participants[0]}
        />

        <Chat messages={messages} image={currentData.image} />

        <div className="p-2 flex items-center">
          <Input
            onSend={async (message: string) => {
              const channel = new BroadcastChannel("sended_messages");
              const msg: IncomeMessage = {
                userId,
                conversationId,
                type: MessageTypes.TEXT,
                content: message,
              };

              channel.postMessage(msg);
            }}
            placeholder={"Message..."}
          />

          <button className="px-2 text-blue-900">
            <SendMessageIcon size={36} />
          </button>
        </div>
      </div>
    </main>
  );
};

export default ConversationRoute;

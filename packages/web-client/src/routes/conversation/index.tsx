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
    userId: message.senderUserId,
  };
  return messageRecord;
};

const findRecipientId = (
  userId: string,
  participants?: LoadConversationResponse["participants"],
) =>
  participants?.find((participant) => participant.user.id !== userId)?.user.id;

const ConversationRoute = () => {
  const { id } = useParams();
  const { userId } = useAppSelector((state) => state.loggedUser);
  const { currentData, isLoading } = useLoadConversationQuery({
    id: id ?? "",
  });

  const recipientUserId = findRecipientId(userId, currentData?.participants);
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
      <ConversationHeader
        image={currentData.image}
        participant={currentData.participants[0]}
      />
      {/*TODO: Move it to CSS */}
      <div style={{ height: "calc(100% - 44px - 74px)" }}>
        <Chat messages={messages} image={currentData.image} />
      </div>
      <Input
        onSend={async (message: string) => {
          const channel = new BroadcastChannel("sended_messages");
          const msg: IncomeMessage = {
            senderUserId: userId,
            recipientUserId,
            type: MessageTypes.TEXT,
            content: message,
          };

          channel.postMessage(msg);
        }}
        placeholder={"Message..."}
      />
    </main>
  );
};

export default ConversationRoute;

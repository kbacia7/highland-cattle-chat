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

const ConversationRoute = () => {
  const { id } = useParams();
  const { userId, privateKey, publicKey } = useAppSelector(
    (state) => state.loggedUser,
  );

  const { currentData } = useLoadConversationQuery({
    id: id ?? "",
  });

  const participantPublicKey = currentData?.participants.find(
    (participant) => participant.user.id !== userId,
  )?.user.publicKey;

  const [messages, setMessages] = useState<
    LoadConversationResponse["messages"]
  >([]);

  useEffect(() => {
    (async () => {
      const channel = new BroadcastChannel("received_messages");
      const internalChannel = new BroadcastChannel("internal_messages");
      internalChannel.postMessage({
        type: InternalMessageTypes.READY,
        content: privateKey,
      });

      channel.addEventListener("message", (event) => {
        const message: OutcomeMessage | OutcomeMessage[] = event.data;
        if (Array.isArray(message)) {
          setMessages([
            ...messages,
            ...message.map((msg) => transformOutcomeMessage(msg)),
          ]);
        } else {
          setMessages([...messages, transformOutcomeMessage(message)]);
        }
      });
    })();
  }, [messages, privateKey]);

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
          if (participantPublicKey) {
            const channel = new BroadcastChannel("sended_messages");
            const msg: IncomeMessage = {
              senderPublicKey: publicKey,
              senderUserId: userId,
              recipientPublicKey: atob(participantPublicKey),
              type: MessageTypes.TEXT,
              content: message,
            };

            channel.postMessage(msg);
          }
        }}
        placeholder={"Message..."}
      />
    </main>
  );
};

export default ConversationRoute;

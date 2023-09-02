import { get } from "idb-keyval";
import type {
  IncomeMessage,
  OutcomeMessage,
} from "@highland-cattle-chat/shared";
import { MessageTypes } from "@highland-cattle-chat/shared";
import Chat from "~/components/Chat";
import ConversationHeader from "~/components/ConversationHeader";

import Input from "~/components/Input";
import { InternalMessageTypes } from "~/consts/broadcast";
import {
  PRIVATE_KEY_ITEM_NAME,
  PUBLIC_KEY_ITEM_NAME,
} from "~/utils/localStorage";
import { useEffect, useState } from "react";

const ConversationRoute = () => {
  const [messages, setMessages] = useState<OutcomeMessage[]>([]);
  useEffect(() => {
    (async () => {
      const channel = new BroadcastChannel("received_messages");
      const internalChannel = new BroadcastChannel("internal_messages");
      internalChannel.postMessage({
        type: InternalMessageTypes.READY,
        content: await get(PRIVATE_KEY_ITEM_NAME),
      });

      channel.addEventListener("message", (event) => {
        const message: OutcomeMessage | OutcomeMessage[] = event.data;
        if (Array.isArray(message)) {
          setMessages([...messages, ...message]);
        } else {
          setMessages([...messages, message]);
        }
      });
    })();
  });

  return (
    <main className="w-full">
      <ConversationHeader />
      {/*TODO: Move it to CSS */}
      <div style={{ height: "calc(100% - 44px - 74px)" }}>
        <Chat messages={messages} />
      </div>
      <Input
        onSend={async (message: string) => {
          const channel = new BroadcastChannel("sended_messages");
          const publicKey = (await get(PUBLIC_KEY_ITEM_NAME)) ?? "";
          const msg: IncomeMessage = {
            senderPublicKey: publicKey,
            recipientPublicKey: publicKey,
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

import { component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import type {
  IncomeMessage,
  OutcomeMessage,
} from "@highland-cattle-chat/shared";
import { MessageTypes } from "@highland-cattle-chat/shared";
import Chat from "~/components/Chat";
import ConversationHeader from "~/components/ConversationHeader";

import Input from "~/components/Input";
import { InternalMessageTypes } from "~/consts/broadcast";

interface ChatState {
  messages: OutcomeMessage[];
}

const TEST_PRIVATE_KEY = `<CUT>
`;

export default component$(() => {
  const state = useStore<ChatState>({ messages: [] });
  useVisibleTask$(() => {
    const channel = new BroadcastChannel("received_messages");
    const internalChannel = new BroadcastChannel("internal_messages");
    internalChannel.postMessage({
      type: InternalMessageTypes.READY,
      content: TEST_PRIVATE_KEY,
    });
    channel.addEventListener("message", (event) => {
      const message: OutcomeMessage | OutcomeMessage[] = event.data;
      console.log("received", message);
      if (Array.isArray(message)) {
        state.messages.push(...event.data);
      } else {
        state.messages.push(event.data);
      }
    });
  });

  console.log("state", state.messages);

  return (
    <main class="w-full">
      <ConversationHeader />
      {/*TODO: Move it to CSS */}
      <div style={{ height: "calc(100% - 44px - 74px)" }}>
        <Chat messages={state.messages} />
      </div>
      <Input
        onSend$={(message: string) => {
          console.log("xd", message);
          const channel = new BroadcastChannel("sended_messages"); //getBroadcastChannel();
          const msg: IncomeMessage = {
            senderPublicKey: "ur-public-key",
            recipientPublicKey: "ur-public-key",
            type: MessageTypes.TEXT,
            content: message,
          };
          channel.postMessage(msg);
        }}
        attributes={{ placeholder: "Message..." }}
      />
    </main>
  );
});

import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import Chat from "~/components/Chat";
import ConversationHeader from "~/components/ConversationHeader";

import Input from "~/components/Input";
export default component$(() => (
  <>
    <ConversationHeader />
    {/*TODO: Move it to CSS */}
    <div style={{ height: "calc(100% - 44px - 74px)" }}>
      <Chat />
    </div>
    <Input attributes={{ placeholder: "Message...." }} />
  </>
));

export const head: DocumentHead = {
  title: "Fuzzia - E2E Chat",
  meta: [
    {
      name: "description",
      content: "Simple E2E Chat build on top of Qwik",
    },
  ],
};

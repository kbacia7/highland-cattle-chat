import { component$ } from "@builder.io/qwik";
import {
  MessageTypes,
  type OutcomeMessage,
} from "@highland-cattle-chat/shared";

type Props = {
  messages: OutcomeMessage[];
};

export default component$<Props>(({ messages }) => (
  <div class="p-5 overflow-y-auto h-full">
    {messages?.length > 0
      ? messages
          .filter(({ type }) => type === MessageTypes.TEXT)
          .map((message, index) => (
            <div class="mb-3 flex items-center" key={index}>
              <div class="inline-block">
                <img
                  class="rounded-full object-cover aspect-square inline"
                  width="50"
                  height="50"
                  src="/hedgehog.jpg"
                />
              </div>
              <div class="ml-2 p-3 pl-3 w-1/3 bg-slate-300 rounded-lg inline-block">
                <p>{message.content}</p>
              </div>
            </div>
          ))
      : ""}
  </div>
));

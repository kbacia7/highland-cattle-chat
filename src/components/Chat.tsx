import { component$, useStore, useVisibleTask$ } from "@builder.io/qwik";

// interface Message {
//   content: string;
// }

interface ChatState {
  messages: string[]; //Message[];
}

export default component$(() => {
  const state = useStore<ChatState>({ messages: [] });
  useVisibleTask$(() => {
    const channel = new BroadcastChannel("test_messages");
    channel.addEventListener("message", (event) => {
      console.log("Received", event.data);
      state.messages.push(event.data);
    });
  });

  console.log("state", state);

  return (
    <div class="p-5 overflow-y-auto h-full">
      {state.messages.map((t) => (
        <div class="mb-3 flex items-center" key={t}>
          <div class="inline-block">
            <img
              class="rounded-full object-cover aspect-square inline"
              width="50"
              height="50"
              src="/hedgehog.jpg"
            />
          </div>
          <div class="ml-2 p-3 pl-3 w-1/3 bg-slate-300 rounded-lg inline-block">
            <p>{t}</p>
          </div>
        </div>
      ))}
    </div>
  );
});

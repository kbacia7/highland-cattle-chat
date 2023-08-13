import { component$, useSignal } from "@builder.io/qwik";
import type { PropFunction, QwikIntrinsicElements } from "@builder.io/qwik";

type Props = {
  onSend$: PropFunction<(message: string) => void>;
  attributes: QwikIntrinsicElements["input"];
};

export default component$<Props>(({ onSend$, attributes }) => {
  const message = useSignal("");
  return (
    <input
      type="text"
      class="p-5 block my-0 mx-auto rounded-full border-blue-200 border-2 h-11 w-1/2 decoration-slate-700 outline-none focus:drop-shadow-md focus:border-blue-300 focus:ring-1"
      bind:value={message}
      onKeyDown$={(event) => {
        if (event.keyCode === 13) {
          onSend$(message.value);
          message.value = "";
        }
      }}
      {...attributes}
    />
  );
});

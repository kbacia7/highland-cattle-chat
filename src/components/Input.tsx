import { component$, type QwikIntrinsicElements } from "@builder.io/qwik";

export default component$<{ attributes: QwikIntrinsicElements["input"] }>(
  ({ attributes }) => (
    <input
      type="text"
      class="p-5 block my-0 mx-auto rounded-full border-blue-200 border-2 h-11 w-1/2 decoration-slate-700 outline-none focus:drop-shadow-md focus:border-blue-300 focus:ring-1"
      {...attributes}
    />
  ),
);

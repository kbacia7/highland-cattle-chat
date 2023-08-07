import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => <p>xd</p>);

export const head: DocumentHead = {
  title: "Fuzzia - E2E Chat",
  meta: [
    {
      name: "description",
      content: "Simple E2E Chat build on top of Qwik",
    },
  ],
};

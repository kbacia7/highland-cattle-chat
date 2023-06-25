import { component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <header class="text-center mt-5">
      <h1 class="text-6xl font-bold text-blue-500">
        <span class="emoji">✨</span> Fuzzia <span class="emoji">✨</span>
      </h1>
      <p>Simple, free, E2E</p>
    </header>
  );
});

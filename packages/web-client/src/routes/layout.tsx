import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import type { RequestHandler } from "@builder.io/qwik-city";
import Chat from "~/components/Chat";
import ConversationHeader from "~/components/ConversationHeader";

import Input from "~/components/Input";
import Nav from "~/components/Nav";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.builder.io/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });
};

export const useServerTimeLoader = routeLoader$(() => ({
  date: new Date().toISOString(),
}));

export default component$(() => (
  <div class="flex h-full">
    <Nav />
    <main class="w-full">
      <ConversationHeader />
      {/*TODO: Move it to CSS */}
      <div style={{ height: "calc(100% - 44px - 74px)" }}>
        <Chat />
      </div>
      <Input attributes={{ placeholder: "Message...." }} />
    </main>
  </div>
));

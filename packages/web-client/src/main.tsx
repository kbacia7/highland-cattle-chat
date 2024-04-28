import React from "react";
import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom";
import { clear } from "idb-keyval";

import {
  HOME_URL_SCHEMA,
  generateHomeUrl,
  CONVERSATION_URL_SCHEMA,
} from "@utils/urlSchemas";

import RootRoute from "./routes";
import HomeRoute from "./routes/home";
import ConversationRoute from "./routes/conversation";

import { store } from "./slices/store";
import { extendedApiSlice } from "./slices/conversations/api";
import { loadUserAccountSettingsFromIDB } from "./slices/user/slice";

import type { LoaderFunction } from "react-router-dom";

import "./index.css";

export const conversationsLoader = (async () => {
  const { userId } = await store
    .dispatch(loadUserAccountSettingsFromIDB())
    .unwrap();

  if (!userId) return redirect(generateHomeUrl());
  const req = store.dispatch(
    extendedApiSlice.endpoints.loadConversations.initiate(),
  );

  try {
    return await req.unwrap();
  } catch (err) {
    console.error(err);
    await clear();
    return redirect(generateHomeUrl());
  } finally {
    req.unsubscribe();
  }
}) satisfies LoaderFunction;

const router = createBrowserRouter([
  {
    path: "/",
    loader: async () => await conversationsLoader(),
    element: <RootRoute />,
    children: [
      {
        path: CONVERSATION_URL_SCHEMA,
        element: <ConversationRoute />,
      },
    ],
  },
  {
    path: HOME_URL_SCHEMA,
    loader: async () => {
      const { userId } = await store
        .dispatch(loadUserAccountSettingsFromIDB())
        .unwrap();

      if (userId) return redirect("/");
      return null;
    },
    element: <HomeRoute />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </Provider>,
);

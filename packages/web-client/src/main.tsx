import React from "react";
import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom";
import { clear } from "idb-keyval";

import RootRoute from "./routes";
import HomeRoute from "./routes/home";
import ConversationRoute from "./routes/conversation";

import { store } from "./slices/store";
import { extendedApiSlice } from "./slices/conversationsSlice";
import { loadUserIdFromIDB } from "./slices/loggedUserSlice";

import type { LoaderFunction } from "react-router-dom";

import "./index.css";

export const conversationsLoader = (async () => {
  await store.dispatch(loadUserIdFromIDB());

  if (!store.getState().loggedUser.userId) return redirect("/home");
  const req = store.dispatch(
    extendedApiSlice.endpoints.loadConversations.initiate(),
  );

  try {
    return await req.unwrap();
  } catch (err) {
    console.error(err);
    await clear();
    return redirect("/home");
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
        path: "conversation/:id",
        element: <ConversationRoute />,
      },
    ],
  },
  {
    path: "/home",
    loader: async () => {
      await store.dispatch(loadUserIdFromIDB());
      if (store.getState().loggedUser.userId) return redirect("/");
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

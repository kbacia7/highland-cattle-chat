import React from "react";
import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import RootRoute from "./routes";
import ConversationRoute from "./routes/conversation";
import { store } from "./slices/store";

import "./index.css";
import HomeRoute from "./routes/home";

const router = createBrowserRouter([
  {
    path: "/",
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

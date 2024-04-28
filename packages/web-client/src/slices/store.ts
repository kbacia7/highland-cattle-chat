import { configureStore } from "@reduxjs/toolkit";

import { apiSlice } from "./apiSlice";
import loggedUserSlice from "./loggedUserSlice";
import conversationsSlice from "./conversations/slice";

export const store = configureStore({
  reducer: {
    loggedUser: loggedUserSlice,
    conversations: conversationsSlice,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

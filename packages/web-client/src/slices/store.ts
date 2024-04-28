import { configureStore } from "@reduxjs/toolkit";

import { apiSlice } from "./apiSlice";
import conversationsSlice from "./conversations/slice";
import userSlice from "./user/slice";

export const store = configureStore({
  reducer: {
    user: userSlice,
    conversations: conversationsSlice,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";

import { apiSlice } from "./apiSlice";

import type {
  ConversationRecord,
  LoadConversationResponse,
  LoadConversationsResponse,
} from "@highland-cattle-chat/shared";

const conversationsAdapter = createEntityAdapter<ConversationRecord>();

const initialState = conversationsAdapter.getInitialState({
  status: "idle",
  cachedConversations: {
    messages: [],
  },
  error: null,
});

const conversationsSlice = createSlice({
  name: "conversations",
  initialState,
  reducers: {},
});

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    loadConversations: builder.query<LoadConversationsResponse, void>({
      query: () => "/load-conversations",
    }),
    loadConversation: builder.query<
      LoadConversationResponse,
      { id: string; limit?: number }
    >({
      query: ({ id, limit }) => ({
        url: "/load-conversation",
        params: { id, limit },
      }),
    }),
  }),
});

export const { useLoadConversationsQuery, useLoadConversationQuery } =
  extendedApiSlice;

export const selectConversationsResult =
  extendedApiSlice.endpoints.loadConversations.select();

export const selectAllConversations = createSelector(
  selectConversationsResult,
  (result) => result?.data ?? [],
);

export default conversationsSlice.reducer;

import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";

import { apiSlice } from "./apiSlice";

import type {
  searchUserSchema,
  Conversation,
  SearchUserResponse,
  CreateConversationResponse,
  LoadConversationResponse,
  LoadConversationsResponse,
  createConversationSchema,
  UploadAttachmentResponse,
} from "@highland-cattle-chat/shared";

import type { z } from "zod";

const conversationsAdapter = createEntityAdapter<Conversation>();

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

export const extendedApiSlice = apiSlice
  .enhanceEndpoints({ addTagTypes: ["Conversation", "User"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      loadConversations: builder.query<LoadConversationsResponse, void>({
        query: () => "/load-conversations",
        providesTags: ["Conversation"],
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

      createConversation: builder.mutation<
        CreateConversationResponse,
        z.infer<typeof createConversationSchema>
      >({
        query: (body) => ({
          url: "/create-conversation",
          method: "POST",
          body,
        }),
        invalidatesTags: ["Conversation", "User"],
      }),

      searchUser: builder.query<
        SearchUserResponse,
        z.infer<typeof searchUserSchema>
      >({
        query: (params) => ({
          url: "/search-user",
          method: "GET",
          params,
        }),
        providesTags: ["User"],
      }),

      uploadAttachment: builder.mutation<UploadAttachmentResponse, FormData>({
        query: (body) => ({
          url: "/upload-attachment",
          method: "POST",
          body,
          formData: true,
        }),
      }),
    }),
  });

export const {
  useLoadConversationsQuery,
  useLoadConversationQuery,
  useCreateConversationMutation,
  useSearchUserQuery,
  useUploadAttachmentMutation,
} = extendedApiSlice;

export const selectConversationsResult =
  extendedApiSlice.endpoints.loadConversations.select();

export const selectAllConversations = createSelector(
  selectConversationsResult,
  (result) => result?.data ?? [],
);

export default conversationsSlice.reducer;

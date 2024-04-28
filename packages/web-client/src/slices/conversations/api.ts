import { apiSlice } from "../apiSlice";

import type { z } from "zod";
import type {
  searchUserSchema,
  SearchUserResponse,
  CreateConversationResponse,
  LoadConversationResponse,
  LoadConversationsResponse,
  createConversationSchema,
  UploadAttachmentResponse,
} from "@highland-cattle-chat/shared";
import type { WithSerializedDates } from "@/types/WithSerializedDates";

export const extendedApiSlice = apiSlice
  .enhanceEndpoints({ addTagTypes: ["Conversation", "User"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      loadConversations: builder.query<
        WithSerializedDates<LoadConversationsResponse>,
        void
      >({
        query: () => "/load-conversations",
        providesTags: ["Conversation"],
      }),

      loadConversation: builder.query<
        WithSerializedDates<LoadConversationResponse>,
        { id: string; limit?: number; last?: string }
      >({
        query: (params) => ({
          url: "/load-conversation",
          params,
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
  useLazyLoadConversationQuery,
  useCreateConversationMutation,
  useSearchUserQuery,
  useUploadAttachmentMutation,
} = extendedApiSlice;

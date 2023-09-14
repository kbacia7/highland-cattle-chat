import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import * as openpgp from "openpgp";
import { get } from "idb-keyval";

import {
  PRIVATE_KEY_ITEM_NAME,
  PRIVATE_KEY_PASSPHRASE_ITEM_NAME,
} from "~/utils/localStorage";

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
      transformResponse: async (response: LoadConversationResponse) => {
        const decrypted = await Promise.all(
          response?.messages.map(async (message) => {
            const newMessage = { ...message };
            newMessage.content = (
              await openpgp.decrypt({
                message: await openpgp.readMessage({
                  config: {
                    allowInsecureDecryptionWithSigningKeys: true,
                  },
                  armoredMessage: message.content,
                }),
                decryptionKeys: await openpgp.decryptKey({
                  privateKey: await openpgp.readPrivateKey({
                    armoredKey: (await get(PRIVATE_KEY_ITEM_NAME)) ?? "",
                  }),
                  passphrase: await get(PRIVATE_KEY_PASSPHRASE_ITEM_NAME),
                }),
              })
            ).data.toString();
            return newMessage;
          }),
        );

        return { ...response, messages: decrypted };
      },
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

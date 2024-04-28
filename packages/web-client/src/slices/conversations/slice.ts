import { createSelector, createSlice } from "@reduxjs/toolkit";

import { USER_STATUS } from "@consts/index";

import { extendedApiSlice } from "./api";

import type { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { LoadConversationsResponse } from "@highland-cattle-chat/shared";
import type { WithSerializedDates } from "@/types/WithSerializedDates";
import type { UserStatus } from "@consts/index";

import type { RootState } from "../store";

type State = {
  conversations: {
    [conversationId: string]: {
      id: string;
      displayName: string;
      image: string;
      status: UserStatus;
      lastMessage?: WithSerializedDates<
        LoadConversationsResponse[0]["messages"][0]
      >;
      unreadedMessages: number;
    };
  };
  error: FetchBaseQueryError["status"] | boolean;
  loading: boolean;
};

type UnreadedMessagesPayload = {
  conversationId: string;
};

const initialState: State = { conversations: {}, error: false, loading: false };

const conversationsSlice = createSlice({
  name: "conversations",
  initialState,
  reducers: {
    updateLastMessage: (
      state,
      action: PayloadAction<
        WithSerializedDates<LoadConversationsResponse[0]["messages"][0]> & {
          conversationId: string;
        }
      >,
    ) => {
      const { conversationId, content, userId, createdAt } = action.payload;

      state.conversations[conversationId].lastMessage = {
        content,
        userId,
        createdAt,
      };

      state.conversations = Object.keys(state.conversations)
        .sort((idA, idB) => {
          const { lastMessage: lastMessageA } = state.conversations[idA];
          const { lastMessage: lastMessageB } = state.conversations[idB];

          if (!lastMessageA && !lastMessageB) return 0;
          return (
            new Date(lastMessageB?.createdAt ?? 0).valueOf() -
            new Date(lastMessageA?.createdAt ?? 0).valueOf()
          );
        })
        .reduce<typeof state.conversations>((obj, key) => {
          obj[key] = state.conversations[key];
          return obj;
        }, {});
    },

    incrementUnreadedConversationMessages: (
      state,
      action: PayloadAction<UnreadedMessagesPayload>,
    ) => {
      if (state.conversations[action.payload.conversationId]) {
        state.conversations[action.payload.conversationId].unreadedMessages++;
      } else {
        state.conversations[action.payload.conversationId].unreadedMessages = 1;
      }
    },

    resetUnreadedConversationMessages: (
      state,
      action: PayloadAction<UnreadedMessagesPayload>,
    ) => {
      state.conversations[action.payload.conversationId].unreadedMessages = 0;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      extendedApiSlice.endpoints.loadConversations.matchFulfilled,
      (state, { payload }) => {
        payload.forEach((conversation) => {
          const participant = conversation.participants[0].user;
          state.conversations[conversation.id] = {
            ...state.conversations[conversation.id],
            id: conversation.id,
            displayName: participant.displayName,
            image: participant.image,
            status: participant.online
              ? USER_STATUS.ONLINE
              : USER_STATUS.OFFLINE,
            lastMessage: conversation.messages[0],
            unreadedMessages: 0,
          };
        });

        state.error = false;
        state.loading = false;
      },
    );

    builder.addMatcher(
      extendedApiSlice.endpoints.loadConversations.matchRejected,
      (state, { payload }) => {
        state.error = payload?.status ?? true;
      },
    );

    builder.addMatcher(
      extendedApiSlice.endpoints.loadConversations.matchPending,
      (state) => {
        state.loading = true;
      },
    );

    builder.addMatcher(
      extendedApiSlice.endpoints.searchUser.matchFulfilled,
      (state, { payload }) => {
        payload.forEach((user) => {
          state.conversations[user.id] = {
            ...state.conversations[user.id],
            id: user.id,
            displayName: user.displayName,
            image: user.image,
            status: USER_STATUS.UNKNOWN,
            unreadedMessages: 0,
          };
        });

        state.error = false;
        state.loading = false;
      },
    );
  },
});

export const {
  incrementUnreadedConversationMessages,
  resetUnreadedConversationMessages,
  updateLastMessage,
} = conversationsSlice.actions;

export const selectConversations = createSelector(
  (state: RootState) => state.conversations,
  ({ conversations }: State) => {
    const filtered = structuredClone(initialState);
    Object.keys(conversations).forEach((id) => {
      const conversation = conversations[id];
      if (conversation.status !== USER_STATUS.UNKNOWN) {
        filtered.conversations[id] = conversation;
      }
    });

    return filtered;
  },
);

export const selectConversationById = (conversationId: string) =>
  createSelector(
    (state: RootState) => state.conversations,
    ({ conversations }) => conversations[conversationId],
  );

export default conversationsSlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { get, set } from "idb-keyval";

import {
  USER_ID_KEY_ITEM_NAME,
  DISPLAY_NAME_KEY_ITEM_NAME,
  EMAIL_KEY_ITEM_NAME,
  PROFILE_PICTURE_KEY_ITEM_NAME,
} from "@utils/localStorage";

import { apiSlice } from "./apiSlice";

import type { z } from "zod";
import type {
  LoginResponse,
  RegisterResponse,
  UpdateAccountResponse,
  loginSchema,
  registerSchema,
} from "@highland-cattle-chat/shared";

type LoggedUserState = {
  userId?: string;
  displayName?: string;
  email?: string;
  profilePicture?: string;
};

const loadUserState = async () => ({
  userId: await get(USER_ID_KEY_ITEM_NAME),
  displayName: await get(DISPLAY_NAME_KEY_ITEM_NAME),
  email: await get(EMAIL_KEY_ITEM_NAME),
  profilePicture: await get(PROFILE_PICTURE_KEY_ITEM_NAME),
});

const initialState: LoggedUserState = await loadUserState();

export const loadUserAccountSettingsFromIDB = createAsyncThunk(
  "loggedUser/loadUserIdFromIDB",
  async () => loadUserState(),
);

export const saveUserAccountSettingsToIDB = createAsyncThunk(
  "loggedUser/saveUserIdToIDB",
  async (state: LoggedUserState) => {
    await set(USER_ID_KEY_ITEM_NAME, state.userId);
    await set(DISPLAY_NAME_KEY_ITEM_NAME, state.displayName);
    await set(EMAIL_KEY_ITEM_NAME, state.email);
    await set(PROFILE_PICTURE_KEY_ITEM_NAME, state.profilePicture);

    return state;
  },
);

const loggedUserSlice = createSlice({
  name: "loggedUser",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(
        loadUserAccountSettingsFromIDB.fulfilled,
        (_state, action) => action.payload,
      )
      .addCase(
        saveUserAccountSettingsToIDB.fulfilled,
        (_state, action) => action.payload,
      );
  },
});

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<
      RegisterResponse,
      z.infer<typeof registerSchema>
    >({
      query: (body) => ({
        url: "/register",
        method: "POST",
        body,
      }),
    }),

    login: builder.mutation<LoginResponse, z.infer<typeof loginSchema>>({
      query: (body) => ({
        url: "/login",
        method: "POST",
        body,
      }),
    }),

    updateAccount: builder.mutation<UpdateAccountResponse, FormData>({
      query: (body) => ({
        url: "/update-account",
        method: "POST",
        body,
        formData: true,
      }),
    }),
  }),
});

export const {
  useUpdateAccountMutation,
  useRegisterMutation,
  useLoginMutation,
} = extendedApiSlice;

export default loggedUserSlice.reducer;

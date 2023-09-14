import { createSlice } from "@reduxjs/toolkit";
import { get } from "idb-keyval";

import {
  PRIVATE_KEY_ITEM_NAME,
  PRIVATE_KEY_PASSPHRASE_ITEM_NAME,
  PUBLIC_KEY_ITEM_NAME,
  USER_ID_KEY_ITEM_NAME,
} from "~/utils/localStorage";

import { apiSlice } from "./apiSlice";

type CreateFakeUserResponse = {
  privateKey: string;
  publicKey: string;
  passphrase: string;
  userId: string;
};

const initialState = {
  privateKey: await get(PRIVATE_KEY_ITEM_NAME),
  publicKey: await get(PUBLIC_KEY_ITEM_NAME),
  passphrase: await get(PRIVATE_KEY_PASSPHRASE_ITEM_NAME),
  userId: await get(USER_ID_KEY_ITEM_NAME),
};

const loggedUserSlice = createSlice({
  name: "loggedUser",
  initialState,
  reducers: {},
});

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createFakeUser: builder.mutation<CreateFakeUserResponse, void>({
      query: () => ({
        url: "/create-fake-user",
      }),
    }),
  }),
});

export const { useCreateFakeUserMutation } = extendedApiSlice;

export default loggedUserSlice.reducer;

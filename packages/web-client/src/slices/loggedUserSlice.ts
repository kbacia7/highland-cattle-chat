import { createSlice } from "@reduxjs/toolkit";
import { get } from "idb-keyval";

import { USER_ID_KEY_ITEM_NAME } from "~/utils/localStorage";

import { apiSlice } from "./apiSlice";

type CreateFakeUserResponse = {
  userId: string;
};

const initialState = {
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

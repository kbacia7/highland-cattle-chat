import { createSlice } from "@reduxjs/toolkit";
import { get } from "idb-keyval";

import { USER_ID_KEY_ITEM_NAME } from "~/utils/localStorage";

import { apiSlice } from "./apiSlice";

import type { z } from "zod";
import type { loginSchema, registerSchema } from "@highland-cattle-chat/shared";

type CreateFakeUserResponse = {
  userId: string;
};

type RegisterResponse = {
  userId?: string;
  error?: string;
};

type LoginResponse = {
  userId?: string;
  error?: string;
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
  }),
});

export const {
  useCreateFakeUserMutation,
  useRegisterMutation,
  useLoginMutation,
} = extendedApiSlice;

export default loggedUserSlice.reducer;

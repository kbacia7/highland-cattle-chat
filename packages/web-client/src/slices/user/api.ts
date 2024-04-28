import { apiSlice } from "../apiSlice";

import type { z } from "zod";
import type {
  LoginResponse,
  RegisterResponse,
  UpdateAccountResponse,
  loginSchema,
  registerSchema,
} from "@highland-cattle-chat/shared";

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

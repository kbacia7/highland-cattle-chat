import { z } from "zod";
import { zfd } from "zod-form-data";

export const updateAccountSchema = zfd.formData({
  displayName: z
    .string()
    .refine(
      (value) => value.trim().length >= 3 && value.match(/^[a-zA-Z0-9_@ -]+$/),
      {
        message:
          "Display name must be at least 3 characters, can contains only letters, numbers, space, and _@-",
      }
    ),
  profilePicture: z.any(),
  email: z.string().email(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
});

export const searchUserSchema = z.object({
  phrase: z
    .string()
    .refine(
      (value) => value.trim().length >= 3 && value.match(/^[a-zA-Z0-9_@ -.]+$/),
      {
        message: "Phrase must be at least 3 characters",
      }
    ),
});

export const createConversationSchema = z.object({
  id: z.string(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
});

export const registerSchema = z
  .object({
    displayName: z
      .string()
      .refine(
        (value) =>
          value.trim().length >= 3 && value.match(/^[a-zA-Z0-9_@ -]+$/),
        {
          message:
            "Display name must be at least 3 characters, can contains only letters, numbers, space, and _@-",
        }
      ),
    email: z.string().email(),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters",
    }),
    repeatPassword: z.string(),
  })
  .refine(
    ({ password, repeatPassword }) =>
      repeatPassword.length > 0 && password === repeatPassword,
    {
      message: "Passwords don't match",
      path: ["repeatPassword"],
    }
  );

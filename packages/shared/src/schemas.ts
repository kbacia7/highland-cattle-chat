import { z } from "zod";

export const registerSchema = z
  .object({
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

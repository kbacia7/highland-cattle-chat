import { z } from "zod";

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
        (value) => value.length > 3 && value.match(/^[a-zA-Z0-9_@ -]+$/),
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

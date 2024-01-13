import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema } from "@highland-cattle-chat/shared";

import Input from "~/components/Input";
import Button from "~/components/Button";
import BasicForm from "~/components/BasicForm";

import { useLoginMutation } from "~/slices/loggedUserSlice";
import isKnownServerSideError from "~/utils/isKnownServerSideError";

import type { z } from "zod";

type Inputs = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [loginUser] = useLoginMutation();

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(loginSchema),
    shouldFocusError: false,
    reValidateMode: "onSubmit",
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      await loginUser(data).unwrap();
    } catch (error) {
      if (isKnownServerSideError(error)) {
        setError("root", {
          message: error.data.error,
        });
      }
    }
  };

  return (
    <>
      <p className="text-base">Log in and find out what you missed</p>
      <BasicForm<Inputs> control={control} onSubmit={handleSubmit(onSubmit)}>
        <div className="first:pt-4 pb-4">
          <Input
            placeholder="E-mail"
            {...register("email")}
            error={!!errors.email}
          />
        </div>

        <div className="first:pt-4 pb-4">
          <Input
            placeholder="Password"
            {...register("password")}
            error={!!errors.password}
            type="password"
          />
        </div>

        <div className="pt-3 pb-4 text-center">
          <Button type="submit" color="primary">
            Log in
          </Button>
        </div>
      </BasicForm>
    </>
  );
};

export default LoginForm;

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@highland-cattle-chat/shared";

import Input from "@components/Input";
import Button from "@components/Button";
import BasicForm from "@components/BasicForm";

import { useRegisterMutation } from "@slices/loggedUserSlice";
import isKnownServerSideError from "@utils/isKnownServerSideError";

import { useToast } from "@contexts/ToastMessagesContext";

import type { z } from "zod";

type Inputs = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const [registerUser] = useRegisterMutation();
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(registerSchema),
    shouldFocusError: false,
    reValidateMode: "onSubmit",
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      await registerUser(data).unwrap();
      addToast({
        type: "success",
        message: "You have successfully registered",
        timeout: 5000,
      });
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
      <p className="text-base">
        You are only moments away from experience of next-generation
        communication
      </p>

      <BasicForm<Inputs> control={control} onSubmit={handleSubmit(onSubmit)}>
        <div className="first:pt-4 pb-4">
          <Input
            placeholder="Display name"
            {...register("displayName")}
            error={!!errors.displayName}
          />
        </div>

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

        <div className="first:pt-4 pb-4">
          <Input
            placeholder="Repeat password"
            {...register("repeatPassword")}
            error={!!errors.repeatPassword}
            type="password"
          />
        </div>

        <div className="pt-3 pb-4 text-center">
          <Button type="submit" color="primary">
            Register
          </Button>
        </div>
      </BasicForm>
    </>
  );
};

export default RegisterForm;

import { useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema } from "@highland-cattle-chat/shared";

import { useLoginMutation } from "@slices/user/api";
import { saveUserAccountSettingsToIDB } from "@slices/user/slice";

import Input from "@components/Input";
import Button from "@components/Button";
import BasicForm from "@components/BasicForm";

import { useAppDispatch } from "@slices/hooks";

import isKnownServerSideError from "@utils/isKnownServerSideError";

import type { z } from "zod";

type Inputs = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [loginUser] = useLoginMutation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

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
      const res = await loginUser(data).unwrap();
      if (res.id) {
        await dispatch(
          saveUserAccountSettingsToIDB({
            userId: res.id,
            displayName: res.displayName,
            email: res.email,
            profilePicture: res.image,
          }),
        ).unwrap();

        navigate("/");
      }
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

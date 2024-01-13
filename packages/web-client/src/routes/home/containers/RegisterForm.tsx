import { createPortal } from "react-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@highland-cattle-chat/shared";

import Input from "~/components/Input";
import Button from "~/components/Button";
import ErrorsToast from "~/components/ErrorsToast";

import type { z } from "zod";

type Inputs = z.infer<typeof registerSchema>;

const RegisterForm = ({
  toastPlacementRef,
}: {
  toastPlacementRef: React.RefObject<HTMLDivElement>;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(registerSchema),
    shouldFocusError: false,
    reValidateMode: "onSubmit",
  });

  // eslint-disable-next-line no-console
  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);

  return (
    <>
      {toastPlacementRef.current &&
        createPortal(
          <ErrorsToast
            errors={
              Object.values(errors)
                .map((v) => v.message)
                .filter(Boolean) as string[]
            }
          />,
          toastPlacementRef.current,
        )}

      <form onSubmit={handleSubmit(onSubmit)}>
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
          />
        </div>

        <div className="first:pt-4 pb-4">
          <Input
            placeholder="Repeat password"
            {...register("repeatPassword")}
            error={!!errors.repeatPassword}
          />
        </div>

        <div className="first:pt-4 pb-4">
          <Button type="submit" color="primary">
            Register
          </Button>
        </div>
      </form>
    </>
  );
};

export default RegisterForm;

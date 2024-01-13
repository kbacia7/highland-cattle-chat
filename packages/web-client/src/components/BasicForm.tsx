import React, { useEffect } from "react";
import { useFormState } from "react-hook-form";

import { useToast } from "~/contexts/ToastMessagesContext";

import type { Control, FieldValues } from "react-hook-form";

interface Props<TFieldValues extends FieldValues>
  extends React.ComponentPropsWithoutRef<"form"> {
  children?: React.ReactNode[];
  control: Control<TFieldValues>;
}

const BasicForm = <TFieldValues extends FieldValues = FieldValues>({
  control,
  ...props
}: Props<TFieldValues>) => {
  const { setToasts } = useToast();
  const { errors, isSubmitSuccessful, submitCount } =
    useFormState<TFieldValues>({ control });

  useEffect(() => {
    if (isSubmitSuccessful) {
      control._reset();
    }
  }, [isSubmitSuccessful, control]);

  useEffect(() => {
    const messages = Object.values(errors);
    if (messages?.length) {
      setToasts(
        messages.map((v) => ({
          type: "error",
          message:
            typeof v?.message === "string" ? v.message : "Something gone wrong",
        })),
      );
    }
  }, [errors, setToasts, submitCount]);

  return <form {...props} />;
};

export default BasicForm;

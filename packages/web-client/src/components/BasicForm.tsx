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
  const { addToast } = useToast();
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
      addToast(
        messages.map((v) => ({
          type: "error",
          message:
            typeof v?.message === "string" ? v.message : "Something gone wrong",
        })),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors, submitCount]);

  return <form {...props} />;
};

export default BasicForm;

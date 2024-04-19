import { cx } from "class-variance-authority";
import React from "react";

import type { ToastOptions } from "@contexts/ToastMessagesContext";

interface Props extends Pick<ToastOptions, "type"> {
  className?: string;
  children?: React.ReactNode;
}

export const Alert = ({ type, className, children }: Props) => (
  <div
    className={cx(
      "z-50 w-full border-2 border-inset font-bold text-lg p-2 first:mt-0 mb-2",
      className,
      {
        "bg-green-100 border-green-300 text-green-900": type === "success",
        "bg-red-100 border-red-300 text-red-900": type === "error",
      },
    )}
  >
    {children}
  </div>
);

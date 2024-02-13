import { cx } from "class-variance-authority";
import { forwardRef } from "react";

export interface InputProps extends React.ComponentPropsWithRef<"input"> {
  error?: boolean;
  color?: "primary" | "white";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, color = "primary", ...props }, inputRef) => (
    <input
      ref={inputRef}
      type="text"
      className={cx(
        "p-5 rounded-full placeholder:text-gray-500 border-gray-100 focus:border-blue-200 border-2 h-11 w-full outline-none focus:drop-shadow-md focus:ring-1",
        {
          "border-red-300 bg-red-100 font-bold text-red-700 placeholder:text-red-500":
            error,
          "bg-blue-100": color === "primary" && !error,
          "bg-white": color === "white" && !error,
        },
      )}
      {...props}
    />
  ),
);

export default Input;

import { cx } from "class-variance-authority";
import React from "react";

interface Props extends React.ComponentPropsWithoutRef<"button"> {
  color: "primary" | "secondary";
  children: React.ReactNode;
  className?: string;
}

const Button = ({ color, children, className, ...props }: Props) => (
  <button
    className={cx(
      "md:rounded-md text-center py-4 min-w-[150px] transition-colors",
      className,
      {
        "bg-blue-500 text-white hover:bg-blue-400": color === "primary",
        "bg-blue-300 text-blue-900 hover:bg-blue-200": color === "secondary",
      },
    )}
    {...props}
  >
    {children}
  </button>
);

export default Button;

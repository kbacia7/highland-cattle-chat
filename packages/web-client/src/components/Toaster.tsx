import { useEffect, useState } from "react";

import { cx } from "class-variance-authority";

import CloseIcon from "./icons/Close";

export type ToastProps = {
  timeout?: number;
  message: string;
  type: "success" | "error";
};

const Toast = ({ timeout, message, type }: ToastProps) => {
  const [visible, setVisible] = useState<boolean>(true);
  useEffect(() => {
    if (visible)
      setTimeout(() => {
        setVisible(false);
      }, timeout);
  }, [visible, timeout]);

  if (!visible) return null;

  return (
    <div
      className={cx(
        "z-50 w-full border-2 border-inset font-bold text-lg p-2 first:mt-0 mb-2 shadow-[0_4px_4px_rgba(0,0,0,0.2)]",
        {
          "bg-green-100 border-green-300 text-green-900": type === "success",
          "bg-red-100 border-red-300 text-red-900": type === "error",
        },
      )}
    >
      <div className="flex flex-row justify-between">
        {message}
        <button onClick={() => setVisible(false)}>
          <CloseIcon />
        </button>
      </div>
    </div>
  );
};

type Props = {
  toasts: ToastProps[];
};

const Toaster = ({ toasts }: Props) => {
  if (!toasts?.length) return null;
  return (
    <div className="absolute top-0 left-0 w-full">
      {toasts.map(({ message, timeout, type }, index) => (
        <Toast
          key={`${toasts.length}-${message.length}`}
          timeout={timeout || 5000 + index * 1000}
          type={type}
          message={message}
        />
      ))}
    </div>
  );
};

export default Toaster;

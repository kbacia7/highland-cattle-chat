import { useState } from "react";

import { cx } from "class-variance-authority";

import CloseIcon from "./icons/Close";

import type { Toast, ToastOptions } from "~/contexts/ToastMessagesContext";

const ToastMessage = ({ message, type }: Omit<ToastOptions, "timeout">) => {
  const [visible, setVisible] = useState<boolean>(true);

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
type ToasterProps = {
  toasts: Toast[];
};

const Toaster = ({ toasts }: ToasterProps) => {
  if (!toasts?.length) return null;
  return (
    <div className="absolute top-0 left-0 w-full">
      {toasts.map(({ message, type, id }) => (
        <ToastMessage key={id} type={type} message={message} />
      ))}
    </div>
  );
};

export default Toaster;

import { useState } from "react";

import CloseIcon from "./icons/Close";

import { Alert } from "./Alert";

import type { Toast, ToastOptions } from "~/contexts/ToastMessagesContext";

const ToastMessage = ({ message, type }: Omit<ToastOptions, "timeout">) => {
  const [visible, setVisible] = useState<boolean>(true);

  if (!visible) return null;
  return (
    <Alert type={type} className="shadow-[0_4px_4px_rgba(0,0,0,0.2)]">
      <div className="flex flex-row justify-between">
        {message}
        <button onClick={() => setVisible(false)}>
          <CloseIcon />
        </button>
      </div>
    </Alert>
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

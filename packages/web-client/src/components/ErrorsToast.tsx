import { useEffect, useState } from "react";

import CloseIcon from "./icons/Close";

const Toast = ({ timeout, message }: { timeout: number; message: string }) => {
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    if (visible)
      setTimeout(() => {
        setVisible(false);
      }, timeout);
  }, [visible, timeout]);

  if (!visible) return null;
  return (
    <div className="z-50 w-full bg-red-100 border-red-300 border-2 border-inset font-bold text-lg text-red-900 p-2 first:mt-0 mb-2 shadow-[0_4px_4px_rgba(0,0,0,0.2)]">
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
  errors: string[];
};

const ErrorsToast = ({ errors }: Props) => (
  <div className="absolute top-0 left-0 w-full">
    {errors.map((message, index) => (
      <Toast
        key={`${errors.length}-${message.length}`}
        timeout={5000 + index * 1000}
        message={message}
      />
    ))}
  </div>
);

export default ErrorsToast;

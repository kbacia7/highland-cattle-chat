import { createContext, useContext, useState } from "react";

import Toaster from "~/components/Toaster";
import { type ToastProps } from "~/components/Toaster";

const ToastMessagesContext = createContext<{
  toasts: ToastProps[];
  addToast: (toast: ToastProps) => void;
  setToasts: React.Dispatch<React.SetStateAction<ToastProps[]>>;
}>({
  toasts: [],
  addToast: () => {},
  setToasts: () => {},
});

export const ToastMessagesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: ToastProps) => {
    setToasts([...toasts, toast]);
  };

  return (
    <ToastMessagesContext.Provider value={{ toasts, addToast, setToasts }}>
      <Toaster toasts={toasts} />
      {children}
    </ToastMessagesContext.Provider>
  );
};

export const useToast = () => {
  const { toasts, addToast, setToasts } = useContext(ToastMessagesContext);
  return { toasts, addToast, setToasts };
};

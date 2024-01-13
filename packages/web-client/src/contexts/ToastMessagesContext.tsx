import { createContext, useContext, useEffect, useState } from "react";

import Toaster from "~/components/Toaster";
import { uniqBy } from "~/utils/uniqBy";

export interface Toast extends ToastOptions {
  id: string;
  createdAt: Date;
}

export type ToastOptions = {
  message: string;
  type: "success" | "error";
  timeout?: number;
};

const ToastMessagesContext = createContext<{
  toasts: Toast[];
  addToast: (toast: ToastOptions | ToastOptions[]) => void;
  clearToasts: () => void;
}>({
  toasts: [],
  addToast: () => {},
  clearToasts: () => {},
});

export const ToastMessagesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const removeOldToasts = () =>
      setToasts((allToasts) =>
        allToasts.filter(
          (toast) =>
            new Date().valueOf() <
            (toast.createdAt?.valueOf() || 0) + (toast.timeout || 0),
        ),
      );

    const interval = setInterval(() => {
      removeOldToasts();
    }, 1500);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const addToast = (toast: ToastOptions | ToastOptions[]) => {
    let newToasts: Toast[] | ToastOptions | ToastOptions[] = toast;
    if (!Array.isArray(newToasts)) newToasts = [newToasts];
    setToasts(
      uniqBy<Toast>(
        [
          ...toasts,
          ...(newToasts.map((toast, index) => ({
            ...toast,
            id: `${toast.message.length}-${Math.floor(
              new Date().valueOf() / 3000,
            )}`,
            createdAt: new Date(),
            timeout: toast.timeout || 5000 + index * 1000,
          })) satisfies Toast[]),
        ],
        "id",
      ),
    );
  };

  const clearToasts = () => setToasts([]);

  return (
    <ToastMessagesContext.Provider value={{ toasts, addToast, clearToasts }}>
      <Toaster toasts={toasts} />
      {children}
    </ToastMessagesContext.Provider>
  );
};

export const useToast = () => {
  const { toasts, addToast, clearToasts } = useContext(ToastMessagesContext);
  return { toasts, addToast, clearToasts };
};

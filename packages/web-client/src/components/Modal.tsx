import { useEffect, useRef } from "react";

import { ToastMessagesProvider } from "~/contexts/ToastMessagesContext";

import CloseIcon from "./icons/Close";

type Props = {
  open?: boolean;
  title: string;
  children: React.ReactNode;
};

const Modal = ({ open, children, title }: Props) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const modal = ref.current;
    if (modal) {
      if (open && !modal.open) {
        modal.inert = true;
        modal.showModal();
        modal.inert = false;
      } else if (!open && modal.open) modal.close();
    }

    return () => {
      if (!open && !modal?.open) modal?.close();
    };
  }, [open, ref]);

  return (
    <dialog
      className="backdrop:bg-black backdrop:opacity-50 w-96 p-4 focus:outline-none rounded-md shadow-[0_4px_4px_rgba(0,0,0,0.2)]"
      ref={ref}
    >
      <ToastMessagesProvider>
        <div className="flex flex-row items-start justify-between">
          <p className="text-2xl font-bold mb-3">{title}</p>
          <button onClick={() => ref.current?.close()}>
            <CloseIcon size={48} />
          </button>
        </div>
        {children}
      </ToastMessagesProvider>
    </dialog>
  );
};

export default Modal;

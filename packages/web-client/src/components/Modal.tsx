import { useEffect, useRef, useState } from "react";

import { ToastMessagesProvider } from "@contexts/ToastMessagesContext";

import CloseIcon from "./icons/Close";

type ToggleRenderFnArgs = {
  openModal: () => void;
};

type Props = {
  initialToggled?: boolean;
  title: string;
  toggleRenderFn: (props: ToggleRenderFnArgs) => React.ReactNode;
  children: React.ReactNode;
};

const Modal = ({
  title,
  toggleRenderFn,
  initialToggled = false,
  children,
}: Props) => {
  const [toggled, setToggled] = useState<boolean>(initialToggled);
  const ref = useRef<HTMLDialogElement>(null);

  const openModal = () => {
    setToggled(true);
  };

  useEffect(() => {
    const modal = ref.current;
    if (modal) {
      if (toggled && !modal.open) {
        modal.inert = true;
        modal.showModal();
        modal.inert = false;
      }
    }

    return () => {
      if (modal?.open) modal?.close();
    };
  }, [toggled, ref]);

  return (
    <>
      {toggleRenderFn({ openModal })}
      {toggled && (
        <dialog
          onClose={() => setToggled(false)}
          className="backdrop:bg-black backdrop:opacity-50 w-full m-0 min-w-full min-h-full lg:w-96 lg:h-fit lg:min-h-0 lg:min-w-0 lg:m-auto p-4 focus:outline-none rounded-md shadow-[0_4px_4px_rgba(0,0,0,0.2)]"
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
      )}
    </>
  );
};

export default Modal;

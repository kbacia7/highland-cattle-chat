import { useRef } from "react";

interface Props extends React.ComponentPropsWithoutRef<"input"> {
  onSend: (message: string) => void;
}

const Input = ({ onSend, ...props }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <input
      ref={inputRef}
      type="text"
      className="p-5 block my-0 mx-auto rounded-full border-blue-200 border-2 h-11 w-1/2 decoration-slate-700 outline-none focus:drop-shadow-md focus:border-blue-300 focus:ring-1"
      onKeyDown={(event) => {
        if (event.keyCode === 13 && inputRef.current) {
          onSend(inputRef.current?.value);
          inputRef.current.value = "";
        }
      }}
      {...props}
    />
  );
};

export default Input;

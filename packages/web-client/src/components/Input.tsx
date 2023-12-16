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
      className="p-5 rounded-full bg-blue-100 placeholder:text-gray-500 border-gray-100 focus:border-blue-200 border-2 h-11 w-full outline-none focus:drop-shadow-md focus:ring-1"
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

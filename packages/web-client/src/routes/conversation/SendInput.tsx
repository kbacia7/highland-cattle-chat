import { useRef } from "react";

import Input from "~/components/Input";

type Props = {
  onSend: (message: string) => void;
};

const SendInput = ({ onSend }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <Input
      ref={inputRef}
      placeholder={"Message..."}
      onKeyDown={(event) => {
        if (event.keyCode === 13 && inputRef.current) {
          onSend(inputRef.current?.value);
          inputRef.current.value = "";
        }
      }}
    />
  );
};

export default SendInput;

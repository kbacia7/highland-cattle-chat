import { ACCEPTED_ATTACHMENT_TYPES } from "@highland-cattle-chat/shared";
import { useRef, useState } from "react";

import Input from "@components/Input";
import GalleryIcon from "@components/icons/Gallery";
import SendMessageIcon from "@components/icons/Send";

import { useUploadAttachmentMutation } from "@slices/conversations/api";

import ImagePreview from "./ImagePreview";

type Props = {
  onSend: (content: { message?: string; attachment?: string }) => void;
};

const SendInput = ({ onSend }: Props) => {
  const inputImageRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>();
  const [uploadAttachmentMutation] = useUploadAttachmentMutation();

  const uploadAttachment = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const { attachment } = await uploadAttachmentMutation(formData).unwrap();
      return attachment;
    } catch (error) {
      console.error(error);
    }
  };

  const onRemoveImage = () => {
    if (inputImageRef.current) inputImageRef.current.value = "";
    setImagePreview(undefined);
  };

  const sendMessage = async () => {
    let attachment;
    if (imagePreview && inputImageRef.current?.files) {
      attachment = await uploadAttachment(inputImageRef.current.files[0]);
      onRemoveImage();
    }

    if (inputRef.current?.value.length) {
      onSend({
        message: inputRef.current.value,
        attachment,
      });
      inputRef.current.value = "";
    } else if (attachment) {
      onSend({
        attachment,
      });
    }
  };

  return (
    <>
      {imagePreview && (
        <div className="mx-2">
          <ImagePreview
            image={imagePreview}
            onRemove={() => {
              onRemoveImage();
            }}
          />
        </div>
      )}

      <div className="p-2 flex items-center">
        <button
          className="px-2 text-blue-900"
          onClick={() => inputImageRef.current?.click()}
        >
          <GalleryIcon size={36} />
        </button>

        <input
          type="file"
          className="hidden"
          ref={inputImageRef}
          accept={ACCEPTED_ATTACHMENT_TYPES.join(",")}
          onChange={(e) => {
            if (e.target.files) {
              setImagePreview(URL.createObjectURL(e.target.files[0]));
            }
          }}
        />

        <Input
          ref={inputRef}
          placeholder={"Message..."}
          onKeyDown={async (event) => {
            if (event.key === "Enter") {
              await sendMessage();
            }
          }}
        />

        <button className="px-2 text-blue-900" onClick={sendMessage}>
          <SendMessageIcon size={36} />
        </button>
      </div>
    </>
  );
};

export default SendInput;

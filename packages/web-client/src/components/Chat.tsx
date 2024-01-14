import { cx } from "class-variance-authority";

import { useAppSelector } from "~/slices/hooks";

import ProfileImage from "./ProfileImage";

import type { LoadConversationResponse } from "@highland-cattle-chat/shared";

type Props = {
  messages?: LoadConversationResponse["messages"];
  image: string;
};

const ChatMessage = ({
  content,
  image,
  createdAt,
  floatRight,
}: LoadConversationResponse["messages"][0] & {
  image: string;
  floatRight: boolean;
}) => (
  <div
    className={cx("mb-3 flex items-start lg:items-center", {
      "lg:justify-end": floatRight,
    })}
  >
    <div className="inline-block">
      <ProfileImage className="inline" size={50} src={image} />
    </div>
    <div
      className={cx(
        "ml-2 p-4 pb-1 w-[85%] lg:w-1/3 rounded-2xl inline-block text-blue-900",
        {
          "bg-blue-300": !floatRight,
          "bg-blue-100": floatRight,
        },
      )}
    >
      <p className="text-lg break-words">{content}</p>
      <p
        className={cx("text-sm text-right mt-1", {
          "text-blue-600": floatRight,
          "text-blue-700": !floatRight,
        })}
      >
        {new Date(createdAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          hour12: true,
          minute: "2-digit",
        })}
      </p>
    </div>
  </div>
);

const Chat = ({ messages, image }: Props) => {
  const loggedUserId = useAppSelector((state) => state.loggedUser.userId);
  return (
    <div className="p-5 overflow-y-auto flex-grow">
      {messages && messages?.length > 0
        ? messages.map((message) => (
            <ChatMessage
              {...message}
              image={image}
              key={message.id}
              floatRight={message.userId === loggedUserId}
            />
          ))
        : ""}
    </div>
  );
};

export default Chat;

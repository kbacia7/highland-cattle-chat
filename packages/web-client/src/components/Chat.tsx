import { useAppSelector } from "~/slices/hooks";

import ProfileImage from "./ProfileImage";

import type { LoadConversationResponse } from "@highland-cattle-chat/shared";

type Props = {
  messages?: LoadConversationResponse["messages"];
  image: string;
};

const ParticipantMessage = ({
  content,
  image,
}: LoadConversationResponse["messages"][0] & { image: string }) => (
  <div className="mb-3 flex items-start lg:items-center">
    <div className="inline-block">
      <ProfileImage className="inline" size={50} src={image} />
    </div>
    <div className="ml-2 p-4 w-[85%] lg:w-1/3 bg-blue-300 rounded-2xl inline-block text-blue-900">
      <p className="text-lg break-words">{content}</p>
    </div>
  </div>
);

const LoggedUserMessage = ({
  content,
  image,
}: LoadConversationResponse["messages"][0] & { image: string }) => (
  <div className="mb-3 flex items-start lg:items-center lg:justify-end">
    <div className="inline-block">
      <ProfileImage className="inline" size={50} src={image} />
    </div>
    <div className="ml-2 p-4 w-[85%] lg:w-1/3 bg-blue-100 rounded-2xl inline-block text-blue-900">
      <p className="text-lg break-words">{content}</p>
    </div>
  </div>
);

const Chat = ({ messages, image }: Props) => {
  const loggedUserId = useAppSelector((state) => state.loggedUser.userId);
  return (
    <div className="p-5 overflow-y-auto">
      {messages && messages?.length > 0
        ? messages.map((message) => {
            if (message.userId !== loggedUserId)
              return (
                <ParticipantMessage
                  {...message}
                  image={image}
                  key={message.id}
                />
              );
            else
              return (
                <LoggedUserMessage
                  {...message}
                  image={image}
                  key={message.id}
                />
              );
          })
        : ""}
    </div>
  );
};

export default Chat;

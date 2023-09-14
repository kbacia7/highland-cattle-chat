import { useAppSelector } from "~/slices/hooks";

import type { LoadConversationResponse } from "@highland-cattle-chat/shared";

type Props = {
  messages?: LoadConversationResponse["messages"];
  image: string;
};

const ParticipantMessage = ({
  content,
  image,
}: LoadConversationResponse["messages"][0] & { image: string }) => (
  <div className="mb-3 flex items-center">
    <div className="inline-block">
      <img
        className="rounded-full object-cover aspect-square inline"
        width="50"
        height="50"
        src={image}
      />
    </div>
    <div className="ml-2 p-3 pl-3 w-1/3 bg-slate-300 rounded-lg inline-block">
      <p>{content}</p>
    </div>
  </div>
);

const LoggedUserMessage = ({
  content,
  id,
}: LoadConversationResponse["messages"][0]) => (
  <div className="mb-3 flex items-center justify-end" key={id}>
    <div className="ml-2 p-3 pl-3 w-1/3 bg-slate-300 rounded-lg inline-block">
      <p>{content}</p>
    </div>
  </div>
);

const Chat = ({ messages, image }: Props) => {
  const loggedUserId = useAppSelector((state) => state.loggedUser.userId);
  return (
    <div className="p-5 overflow-y-auto h-full">
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
            else return <LoggedUserMessage {...message} key={message.id} />;
          })
        : ""}
    </div>
  );
};

export default Chat;

import { useSelector } from "react-redux";

import { useAppSelector } from "@slices/hooks";

import { selectConversationById } from "@slices/conversations/slice";

import ProfileImage from "./ProfileImage";
import Status from "./Status";

type Props = {
  id: string;
};

export const ConversationSkeleton = () => (
  <div className="flex items-center flex-row mb-2 last:mb-0 p-3 w-full animate-pulse">
    <div className="w-1/3">
      <div className="w-20 h-20 bg-blue-300 rounded-full"></div>
    </div>
    <div className="w-2/3">
      <div className="w-3/4 h-3 bg-blue-300"></div>
      <div className="w-1/2 h-3 bg-blue-300 mt-2"></div>
      <div className="w-2/3 h-3 bg-blue-300 mt-2"></div>
    </div>
  </div>
);

const Conversation = ({ id }: Props) => {
  const { userId } = useAppSelector((state) => state.loggedUser);
  const { displayName, status, image, lastMessage, unreadedMessages } =
    useSelector(selectConversationById(id));

  return (
    <div className="flex items-center flex-row mb-2 last:mb-0 p-3 w-full hover:bg-blue-200">
      <div className="w-1/3">
        <ProfileImage size={75} src={image} />
      </div>
      <div className="w-2/3">
        <p className="truncate text-lg text-blue-900 font-bold">
          {displayName} {unreadedMessages ? `(${unreadedMessages})` : ""}
        </p>
        <Status status={status} />
        <p className="truncate text-lg text-blue-900">
          <span className="font-bold">
            {userId === lastMessage?.userId ? "You: " : ""}
          </span>

          {lastMessage?.content}
        </p>
      </div>
    </div>
  );
};

export default Conversation;

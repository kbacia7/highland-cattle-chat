import { cx } from "class-variance-authority";

import { useAppSelector } from "@slices/hooks";

import ProfileImage from "./ProfileImage";
import ArrowBackIcon from "./icons/ArrowBack";

import type { WithSerializedDates } from "@/types/WithSerializedDates";
import type { LoadConversationResponse } from "@highland-cattle-chat/shared";

type Props = {
  messages?: WithSerializedDates<LoadConversationResponse["messages"]>;
  image: string;
  onLoadMore?: () => void;
};

const ChatMessage = ({
  content,
  image,
  attachment,
  createdAt,
  floatRight,
}: WithSerializedDates<LoadConversationResponse["messages"][0]> & {
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
      {attachment && (
        <img
          src={`${
            import.meta.env.VITE_GOOGLE_STORAGE_BUCKET_PUBLIC_URL
          }/${attachment}`}
          className="w-full"
        />
      )}
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

const SHOW_TIMEMARK_AFTER = 1000 * 60 * 30;
const Chat = ({ messages, image, onLoadMore }: Props) => {
  const loggedUser = useAppSelector((state) => state.user);
  let previousMessageDate: number;

  return (
    <div className="p-5 overflow-y-auto flex-grow">
      {onLoadMore && (
        <div className="w-full text-center">
          <button
            className="bg-blue-200 rounded-full hover:bg-blue-400 transition-colors"
            onClick={onLoadMore}
          >
            <ArrowBackIcon
              size={36}
              className="rotate-90 text-blue-500 hover:text-blue-200"
            />
          </button>
        </div>
      )}
      {messages && messages?.length > 0
        ? messages.map((message) => {
            const isMessageFromLogged = message.userId === loggedUser.userId;

            const createdAt = new Date(message.createdAt).valueOf();
            const diff = createdAt - previousMessageDate;
            previousMessageDate = createdAt;

            return (
              <div key={message.id}>
                {diff > SHOW_TIMEMARK_AFTER && (
                  <p className="text-center mt-4 text-blue-600">
                    {new Date(message.createdAt).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}

                <ChatMessage
                  {...message}
                  image={
                    isMessageFromLogged
                      ? loggedUser.profilePicture || ""
                      : image
                  }
                  floatRight={isMessageFromLogged}
                />
              </div>
            );
          })
        : ""}
    </div>
  );
};

export default Chat;

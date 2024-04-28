import { Link } from "react-router-dom";

import { useSelector } from "react-redux";

import {
  resetUnreadedConversationMessages,
  selectConversations,
} from "@slices/conversations/slice";

import { generateConversationUrl } from "@utils/urlSchemas";

import SomethingGoneWrong from "@components/SomethingGoneWrong";
import Conversation, { ConversationSkeleton } from "@components/Conversation";
import { useAppDispatch } from "@slices/hooks";

const ConversationsList = () => {
  const { conversations, loading, error } = useSelector(selectConversations);
  const dispatch = useAppDispatch();

  return (
    <ul className="flex flex-col items-center">
      {loading && <ConversationSkeleton />}
      {error && <SomethingGoneWrong />}
      {!loading &&
        Object.keys(conversations).map((id) => (
          <Link
            to={generateConversationUrl(id)}
            className="w-full"
            key={id}
            onClick={() => {
              dispatch(
                resetUnreadedConversationMessages({
                  conversationId: id,
                }),
              );
            }}
          >
            <Conversation id={id} />
          </Link>
        ))}
    </ul>
  );
};

export default ConversationsList;

import { Link } from "react-router-dom";

import { useLoadConversationsQuery } from "~/slices/conversationsSlice";

import { USER_STATUS } from "~/consts";

import Spinner from "./Spinner";
import Conversation from "./Conversation";
import SettingsIcon from "./icons/Settings";

const Nav = () => {
  const { currentData, isLoading, isError } = useLoadConversationsQuery();

  return (
    <nav className="h-full bg-blue-100 min-w-[400px] max-w-[400px]">
      <div className="flex flex-row align-baseline mx-4 py-2">
        <h2 className="text-3xl font-bold text-blue-900 inline">
          Conversations
        </h2>
        <button>
          <SettingsIcon className="inline ml-3" size={36} />
        </button>
      </div>

      <ul className="flex flex-col items-center">
        {/* TODO: Add error handling */}
        {(isLoading || isError) && (
          <li className="mb-3">
            <Spinner />
          </li>
        )}
        {!isLoading &&
          !isError &&
          currentData?.map(({ id, image, title }) => (
            <Link to={`conversation/${id}`} className="w-full">
              <Conversation
                lastMessage="text"
                status={USER_STATUS.ONLINE}
                title={title}
                image={image}
                key={id}
              />
            </Link>
          ))}
      </ul>
    </nav>
  );
};

export default Nav;

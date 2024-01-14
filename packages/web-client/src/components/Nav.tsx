import { Link } from "react-router-dom";

import { USER_STATUS } from "~/consts";

import Conversation from "./Conversation";
import SettingsIcon from "./icons/Settings";

import type { ConversationRecord } from "@highland-cattle-chat/shared";

type Props = {
  conversations: ConversationRecord[];
};

const Nav = ({ conversations }: Props) => (
  <nav className="h-full bg-blue-100 min-w-[400px] max-w-[400px]">
    <div className="flex flex-row align-baseline mx-4 py-2">
      <h2 className="text-3xl font-bold text-blue-900 inline">Conversations</h2>
      <button>
        <SettingsIcon className="inline ml-3" size={36} />
      </button>
    </div>

    <ul className="flex flex-col items-center">
      {conversations?.map(({ id, image, title }) => (
        <Link to={`conversation/${id}`} className="w-full" key={id}>
          <Conversation
            lastMessage="text"
            status={USER_STATUS.ONLINE}
            title={title}
            image={image}
          />
        </Link>
      ))}
    </ul>
  </nav>
);

export default Nav;

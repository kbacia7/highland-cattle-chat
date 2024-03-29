import { Link } from "react-router-dom";

import ProfileImage from "./ProfileImage";
import ArrowBackIcon from "./icons/ArrowBack";

import type { LoadConversationResponse } from "@highland-cattle-chat/shared";

type Props = {
  image: string;
  participant: LoadConversationResponse["participants"][0];
};

const ConversationHeader = ({ image, participant }: Props) => (
  <div className="w-full h-[74px] bg-blue-100 py-3 px-5 flex items-center">
    <Link to="/" className="lg:hidden mr-2">
      <ArrowBackIcon size={40} />
    </Link>
    <ProfileImage src={image} size={50} />
    <div className="truncate">
      <h2 className="text-xl inline ml-5 font-bold text-blue-900">
        {participant.user.displayName}
      </h2>
    </div>
  </div>
);

export default ConversationHeader;

import ProfileImage from "./ProfileImage";

import type { LoadConversationResponse } from "@highland-cattle-chat/shared";

type Props = {
  image: string;
  participant: LoadConversationResponse["participants"][0];
};
const ConversationHeader = ({ image, participant }: Props) => (
  <div className="w-full h-[74px] bg-white py-3 px-5 drop-shadow-lg">
    <ProfileImage src={image} size={50} />
    <h2 className="inline ml-5 font-bold">{participant.user.displayName}</h2>
  </div>
);

export default ConversationHeader;

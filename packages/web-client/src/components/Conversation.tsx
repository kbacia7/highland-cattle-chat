import ProfileImage from "./ProfileImage";

import Status from "./Status";

import type { UserStatus } from "~/consts";

type Props = {
  title: string;
  status: UserStatus;
  image: string;
  lastMessage?: string;
};

const Conversation = ({ title, status, image, lastMessage }: Props) => (
  <div className="flex items-center flex-row mb-2 last:mb-0 p-3 w-full hover:bg-blue-200">
    <div className="w-1/3">
      <ProfileImage size={75} src={image} />
    </div>
    <div className="w-2/3">
      <p className="truncate text-lg text-blue-900 font-bold">{title}</p>
      <Status status={status} />
      <p className="truncate text-lg text-blue-900">{lastMessage}</p>
    </div>
  </div>
);

export default Conversation;

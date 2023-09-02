import ProfileImage from "./ProfileImage";

import hedgehogImg from "../assets/hedgehog.jpg";

const ConversationHeader = () => (
  <div className="w-full h-[74px] bg-white py-3 px-5 drop-shadow-lg">
    <ProfileImage src={hedgehogImg} size={50} />
    <h2 className="inline ml-5 font-bold">Mr. Hedgehog</h2>
  </div>
);

export default ConversationHeader;

import {
  MessageTypes,
  type OutcomeMessage,
} from "@highland-cattle-chat/shared";

import hedgehogImg from "../assets/hedgehog.jpg";

console.log("ss", hedgehogImg);
type Props = {
  messages: OutcomeMessage[];
};

const Chat = ({ messages }: Props) => (
  <div className="p-5 overflow-y-auto h-full">
    {messages?.length > 0
      ? messages
          .filter(({ type }) => type === MessageTypes.TEXT)
          .map((message, index) => (
            <div className="mb-3 flex items-center" key={index}>
              <div className="inline-block">
                <img
                  className="rounded-full object-cover aspect-square inline"
                  width="50"
                  height="50"
                  src={hedgehogImg}
                />
              </div>
              <div className="ml-2 p-3 pl-3 w-1/3 bg-slate-300 rounded-lg inline-block">
                <p>{message.content}</p>
              </div>
            </div>
          ))
      : ""}
  </div>
);

export default Chat;

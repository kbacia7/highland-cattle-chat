import { MessageTypes } from "@highland-cattle-chat/shared";

import type {
  IncomeMessage,
  OutcomeMessage,
} from "@highland-cattle-chat/shared";

let broadcastChannelActive = false;

let socket: WebSocket;
const oldHistory: OutcomeMessage[] = [];

const receivedChannel = new BroadcastChannel("received_messages");
const sendedChannel = new BroadcastChannel("sended_messages");

const initializeSocket = async () => {
  socket = new WebSocket(`${import.meta.env.VITE_WSS_ENDPOINT}/real-time`);
  socket.addEventListener("message", async (event) => {
    const message: OutcomeMessage = JSON.parse(event.data);
    if (broadcastChannelActive) receivedChannel.postMessage(message);
    else oldHistory.push(message);
  });

  socket.addEventListener("open", async () => {
    const initMessage: IncomeMessage = {
      type: MessageTypes.INIT,
    };

    socket.send(JSON.stringify(initMessage));
  });
};

sendedChannel.addEventListener("message", async (event) => {
  if (!socket) return;

  const message: IncomeMessage = event.data;
  if (!message.content && !message.attachment) return;

  socket.send(JSON.stringify(message));
});

initializeSocket();
broadcastChannelActive = true;
sendedChannel.postMessage(oldHistory);

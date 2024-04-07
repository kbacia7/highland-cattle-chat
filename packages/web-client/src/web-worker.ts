import { MessageTypes } from "@highland-cattle-chat/shared";
import { get } from "idb-keyval";

import { InternalMessageTypes } from "./consts/broadcast";

import { USER_ID_KEY_ITEM_NAME } from "./utils/localStorage";

import type { InternalMessage } from "./consts/broadcast";
import type {
  IncomeMessage,
  OutcomeMessage,
} from "@highland-cattle-chat/shared";

let broadcastChannelActive = false;

let socket: WebSocket;
const oldHistory: OutcomeMessage[] = [];

const receivedChannel = new BroadcastChannel("received_messages");
const sendedChannel = new BroadcastChannel("sended_messages");
const internalChannel = new BroadcastChannel("internal_messages");

const initializeSocket = async () => {
  const USER_ID = await get<string>(USER_ID_KEY_ITEM_NAME);
  if (!USER_ID) {
    throw new Error("Oops, USER_ID is missing");
  }

  socket = new WebSocket(`${import.meta.env.VITE_WSS_ENDPOINT}/real-time`);
  socket.addEventListener("message", async (event) => {
    const message: OutcomeMessage = JSON.parse(event.data);
    if (broadcastChannelActive) receivedChannel.postMessage(message);
    else oldHistory.push(message);
  });

  socket.addEventListener("open", async () => {
    const initMessage: IncomeMessage = {
      type: MessageTypes.INIT,
      userId: USER_ID,
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

internalChannel.addEventListener("message", async (event) => {
  if (broadcastChannelActive) return;
  const message: InternalMessage = event.data;
  switch (message.type) {
    case InternalMessageTypes.READY: {
      initializeSocket();
      broadcastChannelActive = true;
      sendedChannel.postMessage(oldHistory);
      break;
    }
  }
});

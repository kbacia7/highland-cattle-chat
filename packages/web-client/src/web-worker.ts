import { MessageTypes } from "@highland-cattle-chat/shared";

import {
  encrypt,
  createMessage,
  readKey,
  readPrivateKey,
  decryptKey,
  decrypt,
  readMessage,
} from "openpgp";
import { get } from "idb-keyval";

import { InternalMessageTypes } from "./consts/broadcast";

import {
  PRIVATE_KEY_PASSPHRASE_ITEM_NAME,
  PUBLIC_KEY_ITEM_NAME,
  USER_ID_KEY_ITEM_NAME,
} from "./utils/localStorage";

import type { PrivateKey } from "openpgp";

import type { InternalMessage } from "./consts/broadcast";
import type {
  IncomeMessage,
  OutcomeMessage,
} from "@highland-cattle-chat/shared";

const oldHistory: OutcomeMessage[] = [];
let broadcastChannelActive = false;
let privateKey: PrivateKey;
const receivedChannel = new BroadcastChannel("received_messages");
const sendedChannel = new BroadcastChannel("sended_messages");
const internalChannel = new BroadcastChannel("internal_messages");

const socket = new WebSocket("wss://localhost:3000/real-time");

const TEST_PUBLIC_KEY = await get<string>(PUBLIC_KEY_ITEM_NAME);
const USER_ID = await get<string>(USER_ID_KEY_ITEM_NAME);
if (!TEST_PUBLIC_KEY || !USER_ID) {
  throw new Error("Oops, TEST_PUBLIC_KEY or USER_ID is missing");
}

socket.addEventListener("open", () => {
  const initMessage: IncomeMessage = {
    type: MessageTypes.INIT,
    senderPublicKey: TEST_PUBLIC_KEY,
    senderUserId: USER_ID,
  };

  socket.send(JSON.stringify(initMessage));
});

socket.addEventListener("message", async (event) => {
  const message: OutcomeMessage = JSON.parse(event.data);
  if (message.content && message.type === MessageTypes.TEXT) {
    message.content = (
      await decrypt({
        message: await readMessage({
          armoredMessage: message.content,
        }),
        decryptionKeys: privateKey,
      })
    ).data.toString();
  }
  if (broadcastChannelActive) receivedChannel.postMessage(message);
  else oldHistory.push(message);
});

sendedChannel.addEventListener("message", async (event) => {
  const message: IncomeMessage = event.data;
  if (!message.content || !message.recipientPublicKey) return;
  message.content = (
    await encrypt({
      message: await createMessage({ text: message.content }),
      encryptionKeys: [
        await readKey({
          armoredKey: message.senderPublicKey,
        }),
        await readKey({
          armoredKey: message.recipientPublicKey,
        }),
      ],
    })
  ).toString();

  socket.send(JSON.stringify(message));
});

internalChannel.addEventListener("message", async (event) => {
  const message: InternalMessage = event.data;
  switch (message.type) {
    case InternalMessageTypes.READY: {
      privateKey = await decryptKey({
        privateKey: await readPrivateKey({ armoredKey: message.content }),
        passphrase: await get<string>(PRIVATE_KEY_PASSPHRASE_ITEM_NAME),
      });

      broadcastChannelActive = true;
      sendedChannel.postMessage(oldHistory);
      break;
    }
  }
});

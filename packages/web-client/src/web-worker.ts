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
import { set } from "idb-keyval";

import { InternalMessageTypes } from "./consts/broadcast";

import { CREATE_FAKE_USER } from "./consts/endpoints";
import {
  PRIVATE_KEY_ITEM_NAME,
  PRIVATE_KEY_PASSPHRASE_ITEM_NAME,
  PUBLIC_KEY_ITEM_NAME,
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

fetch(`https://localhost:3000/${CREATE_FAKE_USER}`, {
  method: "GET",
  mode: "cors",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
}).then(async (response) => {
  const json = await response.json();
  const socket = new WebSocket("ws://localhost:3000/real-time");
  const TEST_PUBLIC_KEY: string = json.publicKey;
  set(PRIVATE_KEY_ITEM_NAME, json.privateKey);
  set(PRIVATE_KEY_PASSPHRASE_ITEM_NAME, json.passphrase);
  set(PUBLIC_KEY_ITEM_NAME, json.publicKey);

  socket.addEventListener("open", () => {
    socket.send(
      JSON.stringify({
        type: MessageTypes.INIT,
        senderPublicKey: TEST_PUBLIC_KEY,
      }),
    );
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

    message.recipientPublicKey = TEST_PUBLIC_KEY;
    message.senderPublicKey = TEST_PUBLIC_KEY;
    message.content = (
      await encrypt({
        message: await createMessage({ text: message.content }),
        encryptionKeys: await readKey({
          armoredKey: message.recipientPublicKey,
        }),
      })
    ).toString();

    console.log("send", message);
    socket.send(JSON.stringify(message));
  });

  internalChannel.addEventListener("message", async (event) => {
    const message: InternalMessage = event.data;
    switch (message.type) {
      case InternalMessageTypes.READY: {
        privateKey = await decryptKey({
          privateKey: await readPrivateKey({ armoredKey: message.content }),
          passphrase: json.passphrase,
        });

        broadcastChannelActive = true;
        sendedChannel.postMessage(oldHistory);
        break;
      }
    }
  });
});

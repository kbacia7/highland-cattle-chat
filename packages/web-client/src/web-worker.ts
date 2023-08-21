import type {
  IncomeMessage,
  OutcomeMessage,
} from "@highland-cattle-chat/shared";
import { MessageTypes } from "@highland-cattle-chat/shared";
import type { InternalMessage } from "./consts/broadcast";
import { InternalMessageTypes } from "./consts/broadcast";

import type { PrivateKey } from "openpgp";
import {
  encrypt,
  createMessage,
  readKey,
  readPrivateKey,
  decryptKey,
  decrypt,
  readMessage,
} from "openpgp";
const TEST_PUBLIC_KEY = `-----BEGIN PGP PUBLIC KEY BLOCK-----

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
=Jrbf
-----END PGP PUBLIC KEY BLOCK-----
`;

const oldHistory: OutcomeMessage[] = [];
let broadcastChannelActive = false;
let privateKey: PrivateKey;
const receivedChannel = new BroadcastChannel("received_messages");
const sendedChannel = new BroadcastChannel("sended_messages");
const internalChannel = new BroadcastChannel("internal_messages");

const socket = new WebSocket("ws://localhost:3000/real-time");

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
  console.log("wrr", message);
});

sendedChannel.addEventListener("message", async (event) => {
  console.log("wat");
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
        passphrase: "123",
      });

      broadcastChannelActive = true;
      sendedChannel.postMessage(oldHistory);
      break;
    }
  }
});

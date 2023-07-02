type Message = {
  type: 'init' | 'text'
  senderPublicKey: string
  recipientPublicKey?: string
  content?: string
};

const convertRawMessage = (message: string) => {
  // TODO: Handle binary messages
  try {
    // TODO: Extra validation
    return JSON.parse(message) as Message;
  } catch (e) {
    return null;
  }
};

type ConnectedClients = Record<string, {
  socket: WebSocket
}>;

const connectedClients: ConnectedClients = {};

// TODO: Error handling, validation etc.
export const handleMessage = (rawMessage: string, socket: WebSocket): void => {
  const message = convertRawMessage(rawMessage);
  if (message == null) { return; }
  switch (message.type) {
    case 'init': {
      connectedClients[message.senderPublicKey] = { socket };
      const response: Message = {
        senderPublicKey: 'SERVER',
        recipientPublicKey: message.senderPublicKey,
        content: 'OK',
        type: 'init',
      };

      socket.send(JSON.stringify(response));
      break;
    }
    case 'text': {
      const { socket: recipientSocket } = connectedClients?.[message.recipientPublicKey || ''];
      recipientSocket?.send(JSON.stringify(message));
      break;
    }
  }
};

const channel = new BroadcastChannel("test_messages");
const socket = new WebSocket("ws://localhost:3000/real-time");

socket.addEventListener("open", () => {
  socket.send(
    JSON.stringify({
      type: "init",
      senderPublicKey: `${(Math.random() + 1)
        .toString(36)
        .substring(7)}-${Date.now().valueOf()}`,
    }),
  );
});

socket.addEventListener("message", async (event) => {
  channel.postMessage(event.data);
  console.log("Message from server ", event.data);
});

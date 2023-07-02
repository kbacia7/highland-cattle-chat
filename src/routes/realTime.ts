import type { FastifyInstance } from "fastify";
import { handleMessage } from "../messages";

const realTimeRoute = async (fastify: FastifyInstance) => {
  fastify.get(
    "/real-time",
    { websocket: true, logLevel: "debug" },
    (connection) => {
      connection.socket.on("message", (data) => {
        handleMessage(data.toString(), connection.socket);
      });
    },
  );
};

export default realTimeRoute;

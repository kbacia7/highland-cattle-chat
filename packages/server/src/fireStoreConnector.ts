import fp from "fastify-plugin";
import { Firestore } from "@google-cloud/firestore";

import type { FastifyPluginCallback } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    firestore: Firestore;
  }
}

const fireStoreConnector: FastifyPluginCallback = async (
  fastify,
  options,
  done,
) => {
  const firestore = new Firestore(
    process.env.NODE_ENV !== "development"
      ? {
          projectId: "highland-cattle-chat",
        }
      : {
          projectId: "highland-cattle-chat",
          host: "127.0.0.1:8080",
          ssl: false,
        },
  );

  if (!fastify.firestore) {
    fastify.decorate("firestore", firestore);
  }

  // TODO: Handle onClose
  done();
};

export default fp(fireStoreConnector, { name: "fastify-firestore" });

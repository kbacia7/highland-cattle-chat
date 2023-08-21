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
  const firestore = new Firestore({
    projectId: "highland-cattle-chat",
  });

  if (!fastify.firestore) {
    fastify.decorate("firestore", firestore);
  }

  // TODO: Handle onClose
  done();
};

export default fp(fireStoreConnector, { name: "fastify-firestore" });

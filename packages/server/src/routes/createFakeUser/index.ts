import { v4 as uuidv4 } from "uuid";

import { setSessionCookie } from "@routes/login";
import generateKeysForTests from "@test/utils/generateKeysForTests";

import type { FastifyInstance } from "fastify";

const createFakeUserRoute = async (fastify: FastifyInstance) => {
  fastify.get(
    "/create-fake-user",
    { logLevel: "debug" },
    async (req, reply) => {
      const pgpTestKey = await generateKeysForTests();
      const displayName = `Normal-User-${new Date().valueOf()}`;
      const alias = displayName.toLowerCase();
      const userRef = await fastify.firestore.collection("users").add({
        displayName,
        publicKey: {
          alias,
          value: Buffer.from(pgpTestKey.publicKey).toString("base64"),
        },
      });

      for (let i = 0; i < 10; i += 1)
        // eslint-disable-next-line no-await-in-loop
        await fastify.firestore.collection("conversations").add({
          users: [userRef, userRef],
          title: uuidv4(),
          image: "https://picsum.photos/200",
        });

      return setSessionCookie(userRef.id, reply, fastify).send(pgpTestKey);
    },
  );
};

export default createFakeUserRoute;

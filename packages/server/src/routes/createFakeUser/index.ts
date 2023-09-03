import { FieldValue } from "@google-cloud/firestore";
import { v4 as uuidv4 } from "uuid";

import { setSessionCookie } from "@routes/login";
import generateKeysForTests from "@test/utils/generateKeysForTests";
import generateString from "@test/utils/randomString";

import type { FastifyInstance } from "fastify";

const createFakeUserRoute = async (fastify: FastifyInstance) => {
  fastify.get(
    "/create-fake-user",
    { logLevel: "debug" },
    async (req, reply) => {
      if (req.cookies.session) return reply.send();
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

      for (let i = 0; i < 10; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const conversationRef = await fastify.firestore
          .collection("conversations")
          .add({
            users: [userRef, userRef],
            title: uuidv4(),
            image: "https://picsum.photos/200",
          });

        for (let j = 0; j < 10; j += 1) {
          // eslint-disable-next-line no-await-in-loop
          await fastify.firestore.collection("messages").add({
            user: userRef,
            conversation: conversationRef,
            content: generateString(j + 1),
            created: FieldValue.serverTimestamp(),
          });
        }
      }

      return setSessionCookie(userRef.id, reply, fastify).send(pgpTestKey);
    },
  );
};

export default createFakeUserRoute;

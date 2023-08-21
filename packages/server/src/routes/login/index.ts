import * as openpgp from "openpgp";

import { SESSION_AGE_IN_MS, createSession } from "@helpers/sessions";

import type { SessionCookie } from "@highland-cattle-chat/shared";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

type LoginStringRequest = FastifyRequest<{
  Body: {
    signedAlias: string;
  };
}>;

const setSessionCookie = (
  userId: string,
  reply: FastifyReply,
  fastify: FastifyInstance,
) => {
  const token = createSession(userId, fastify.firestore);
  const cookie: SessionCookie = {
    userId,
    token,
  };

  reply.setCookie("session", JSON.stringify(cookie), {
    signed: true,
    secure: true,
    httpOnly: true,
    maxAge: SESSION_AGE_IN_MS / 1000,
  });

  return reply;
};

const loginUserRoute = async (fastify: FastifyInstance) => {
  fastify.post(
    "/login",
    {
      logLevel: "debug",
      schema: {
        body: {
          type: "object",
          required: ["signedAlias"],
          properties: {
            signedAlias: { type: "string" },
          },
        },
      },
    },
    async (req: LoginStringRequest, reply) => {
      let cleartextMessage;
      try {
        cleartextMessage = await openpgp.readCleartextMessage({
          cleartextMessage: req.body.signedAlias,
        });
      } catch (e) {
        return reply.code(400).send();
      }

      const alias = cleartextMessage.getText();
      const userQuery = await fastify.firestore
        .collection("users")
        .where("publicKey.alias", "==", alias)
        .limit(1)
        .get();

      if (userQuery.empty) return reply.code(403).send();

      const userRecord = userQuery.docs[0];
      const user = userRecord.data();
      const publicKey = Buffer.from(user.publicKey.value, "base64").toString(
        "ascii",
      );

      const verificationResult = await openpgp.verify({
        message: cleartextMessage,
        verificationKeys: await openpgp.readKey({ armoredKey: publicKey }),
      });

      const { verified } = verificationResult.signatures[0];
      try {
        await verified;
      } catch (e) {
        return reply.code(403).send();
      }

      return setSessionCookie(userRecord.id, reply, fastify).send(user);
    },
  );
};

export default loginUserRoute;

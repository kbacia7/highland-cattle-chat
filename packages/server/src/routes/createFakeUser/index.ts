import * as openpgp from "openpgp";
import { v4 as uuidv4 } from "uuid";

import { setSessionCookie } from "@routes/login";
import generateKeysForTests from "@test/utils/generateKeysForTests";
import generateString from "@test/utils/randomString";

import { createSession } from "@helpers/sessions";

import type { FastifyInstance } from "fastify";

let memSecondRes: any = null;
const createFakeUser = async (fastify: FastifyInstance) => {
  const displayName = `User ${uuidv4()}`;
  const login = displayName.toLowerCase().replace(" ", "-");
  const pgpTestKey = await generateKeysForTests(86400);
  return {
    pgpTestKey,
    user: await fastify.prisma.user.create({
      data: {
        displayName,
        login,
        publicKey: Buffer.from(pgpTestKey.publicKey).toString("base64"),
      },
    }),
  };
};

const createFakeUserRoute = async (fastify: FastifyInstance) => {
  fastify.get(
    "/create-fake-user",
    { logLevel: "debug" },
    async (req, reply) => {
      if (req.cookies.session) return reply.send();
      if (memSecondRes) {
        const token = await createSession(memSecondRes.userId, fastify.prisma);
        return setSessionCookie(token, memSecondRes.userId, reply).send(
          memSecondRes,
        );
      }

      const { pgpTestKey, user } = await createFakeUser(fastify);
      const { pgpTestKey: secondPgpTestKey, user: secondUser } =
        await createFakeUser(fastify);

      for (let i = 0; i < 5; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const fakeConversation = await fastify.prisma.conversation.create({
          data: {
            title: uuidv4(),
            image: "https://picsum.photos/200",
            participants: {
              create: [{ userId: user.id }, { userId: secondUser.id }],
            },
          },
        });

        // eslint-disable-next-line no-await-in-loop
        const messagesToCreate = await Promise.all(
          [...Array(30)].map(async () => ({
            content: (
              await openpgp.encrypt({
                message: await openpgp.createMessage({
                  text: generateString(Math.ceil(Math.random() * 5)),
                }),
                encryptionKeys: [
                  await openpgp.readKey({
                    armoredKey: pgpTestKey.publicKey,
                  }),
                  await openpgp.readKey({
                    armoredKey: secondPgpTestKey.publicKey,
                  }),
                ],
              })
            ).toString(),
            conversationId: fakeConversation.id,
            userId: Math.random() > 0.5 ? user.id : secondUser.id,
          })),
        );

        // eslint-disable-next-line no-await-in-loop
        await fastify.prisma.message.createMany({
          data: messagesToCreate,
        });
      }

      const token = await createSession(user.id, fastify.prisma);
      memSecondRes = {
        ...secondPgpTestKey,
        userId: secondUser.id,
      };

      return setSessionCookie(token, user.id, reply).send({
        ...pgpTestKey,
        userId: user.id,
      });
    },
  );
};

export default createFakeUserRoute;

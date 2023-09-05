import { v4 as uuidv4 } from "uuid";

import { setSessionCookie } from "@routes/login";
import generateKeysForTests from "@test/utils/generateKeysForTests";
import generateString from "@test/utils/randomString";

import { createSession } from "@helpers/sessions";

import type { FastifyInstance } from "fastify";

const createFakeUserRoute = async (fastify: FastifyInstance) => {
  fastify.get(
    "/create-fake-user",
    { logLevel: "debug" },
    async (req, reply) => {
      if (req.cookies.session) return reply.send();
      const pgpTestKey = await generateKeysForTests();
      const displayName = `Normal-User-${new Date().valueOf()}`;
      const login = displayName.toLowerCase();
      const user = await fastify.prisma.user.create({
        data: {
          displayName,
          login,
          publicKey: Buffer.from(pgpTestKey.publicKey).toString("base64"),
          participates: {
            create: [...Array(10)].map(() => ({
              conversation: {
                create: {
                  title: uuidv4(),
                  image: "https://picsum.photos/200",
                  messages: {
                    create: [...Array(10)].map(() => ({
                      content: generateString(Math.ceil(Math.random() * 5)),
                      user: {
                        connect: {
                          login,
                        },
                      },
                    })),
                  },
                },
              },
            })),
          },
        },
      });

      const token = await createSession(user.id, fastify.prisma);
      return setSessionCookie(token, user.id, reply).send(pgpTestKey);
    },
  );
};

export default createFakeUserRoute;

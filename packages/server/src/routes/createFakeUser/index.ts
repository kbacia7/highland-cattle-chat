import { v4 as uuidv4 } from "uuid";

import { setSessionCookie } from "@routes/login";
import generateString from "@test/utils/randomString";

import { createSession } from "@helpers/sessions";

import type { FastifyInstance } from "fastify";

let memSecondRes: any = null;
const createFakeUser = async (fastify: FastifyInstance) => {
  const displayName = `User ${uuidv4()}`;
  const login = displayName.toLowerCase().replace(" ", "-");
  return {
    user: await fastify.prisma.user.create({
      data: {
        displayName,
        login,
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

      const { user } = await createFakeUser(fastify);
      const { user: secondUser } = await createFakeUser(fastify);

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
            content: generateString(Math.ceil(Math.random() * 5)),
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
        userId: secondUser.id,
      };

      return setSessionCookie(token, user.id, reply).send({
        userId: user.id,
      });
    },
  );
};

export default createFakeUserRoute;

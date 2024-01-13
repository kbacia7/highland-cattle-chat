import { v4 as uuidv4 } from "uuid";

import { setSessionCookie } from "@routes/login";
import generateString from "@test/utils/randomString";

import { createSession, verifySession } from "@helpers/sessions";

import type { FastifyInstance } from "fastify";
import type { SessionCookie } from "@highland-cattle-chat/shared";

let memorizedFirstResponse: { userId: string } | undefined;
let memorizedSecondResponse: { userId: string } | undefined;
let toggleSecondRes: boolean = false;

const createFakeUser = async (fastify: FastifyInstance) => {
  const displayName = `User ${uuidv4()}`;
  const email = `${displayName.toLowerCase().replace(" ", "-")}@example.com`;
  const password = `password-${email}`;

  return {
    user: await fastify.prisma.user.create({
      data: {
        displayName,
        email,
        password,
      },
    }),
  };
};

const createFakeUserRoute = async (fastify: FastifyInstance) => {
  fastify.addHook("onReady", async () => {
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

    memorizedFirstResponse = {
      userId: user.id,
    };

    memorizedSecondResponse = {
      userId: secondUser.id,
    };
  });

  fastify.get(
    "/create-fake-user",
    { logLevel: "debug" },
    async (req, reply) => {
      if (req.cookies.session) {
        const sessionCookie = req.cookies.session;
        const session: SessionCookie = JSON.parse(
          fastify.unsignCookie(sessionCookie).value ?? "",
        );

        const userId = await verifySession(
          session.token,
          session.userId,
          fastify.prisma,
        );

        if (memorizedFirstResponse?.userId === userId)
          return reply.send(memorizedFirstResponse);
        if (memorizedSecondResponse?.userId === userId)
          return reply.send(memorizedSecondResponse);
      }

      const memorizedRes = toggleSecondRes
        ? memorizedSecondResponse
        : memorizedFirstResponse;

      if (!memorizedRes?.userId) {
        throw new Error();
      }

      toggleSecondRes = !toggleSecondRes;
      const token = await createSession(memorizedRes.userId, fastify.prisma);
      return setSessionCookie(token, memorizedRes.userId, reply).send(
        memorizedRes,
      );
    },
  );
};

export default createFakeUserRoute;

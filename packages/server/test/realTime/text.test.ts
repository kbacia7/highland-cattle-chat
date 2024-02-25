import {
  afterAll,
  beforeAll,
  describe,
  expect,
  test,
  afterEach,
  beforeEach,
} from "vitest";
import WebSocket from "ws";
import { v4 as uuidv4 } from "uuid";
import { SERVER_USER_ID } from "@highland-cattle-chat/shared";

import buildForTests from "@test/utils/buildForTests";

import { FASTIFY_SERVER_PORT_BASE } from "@test/utils/consts";

import type { FastifyInstance } from "fastify";
import type {
  IncomeMessage,
  OutcomeMessage,
} from "@highland-cattle-chat/shared";
import type { Prisma } from "@prisma/client";

describe("Websocket real-time route - Message type TEXT", () => {
  let fastify: FastifyInstance;
  const SERVER_PORT = FASTIFY_SERVER_PORT_BASE + 3;
  let testUser: Prisma.UserUncheckedCreateInput;
  let secondTestUser: Prisma.UserUncheckedCreateInput;
  let testConversation: Prisma.ConversationGetPayload<{
    include: {
      participants: true;
    };
  }>;

  beforeEach(async () => {
    fastify = await buildForTests();
    await fastify.listen({ port: SERVER_PORT });
  });

  afterEach(async () => {
    await fastify.close();
  });

  beforeAll(async () => {
    fastify = await buildForTests();
    testUser = await fastify.prisma.user.findFirstOrThrow({
      where: {
        email: "john@example.com",
      },
    });

    secondTestUser = await fastify.prisma.user.findFirstOrThrow({
      where: {
        email: "mike@example.com",
      },
    });

    testConversation = await fastify.prisma.conversation.findFirstOrThrow({
      where: {
        participants: {
          some: {
            user: {
              email: "john@example.com",
            },
          },
        },
      },
      include: {
        participants: true,
      },
    });
  });

  afterAll(async () => {
    await fastify.close();
  });

  test("should send message to both participants", () =>
    new Promise<void>((done) => {
      const senderWs = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
      const recipientWs = new WebSocket(
        `ws://localhost:${SERVER_PORT}/real-time`,
      );
      const senderClient = WebSocket.createWebSocketStream(senderWs);
      const recipientClient = WebSocket.createWebSocketStream(recipientWs);
      let doneInitializations = 0;
      let receivedText = 0;
      const onInit = () =>
        doneInitializations === 2 &&
        senderClient.write(
          JSON.stringify({
            type: "TEXT",
            userId: testUser.id,
            conversationId: testConversation.id,
            content: "Message",
          } as IncomeMessage),
        );

      senderClient.write(
        JSON.stringify({
          type: "INIT",
          userId: testUser.id,
        } as IncomeMessage),
      );

      recipientClient.write(
        JSON.stringify({
          type: "INIT",
          userId: secondTestUser.id,
        } as IncomeMessage),
      );

      const onEnd = () => {
        if (receivedText === 2) {
          senderWs.close();
          recipientWs.close();
          done();
        }
      };

      senderClient.on("data", (chunk: Buffer) => {
        const res = JSON.parse(chunk.toString()) as OutcomeMessage;
        if (res.type === "INIT") {
          doneInitializations += 1;
          expect(res).toStrictEqual({
            userId: SERVER_USER_ID,
            type: "INIT",
            status: "OK",
          } as OutcomeMessage);

          onInit();
        } else {
          receivedText += 1;
          expect(res).toStrictEqual({
            userId: testUser.id,
            type: "TEXT",
            conversationId: testConversation.id,
            content: "Message",
            status: "OK",
          } as OutcomeMessage);

          onEnd();
        }
      });

      recipientClient.on("data", (chunk: Buffer) => {
        const res = JSON.parse(chunk.toString());
        if (res.type === "INIT") {
          doneInitializations += 1;
          expect(res).toStrictEqual({
            userId: SERVER_USER_ID,
            type: "INIT",
            status: "OK",
          } as OutcomeMessage);

          onInit();
        } else {
          receivedText += 1;
          expect(res).toStrictEqual({
            userId: testUser.id,
            type: "TEXT",
            conversationId: testConversation.id,
            content: "Message",
            status: "OK",
          } as OutcomeMessage);

          onEnd();
        }
      });
    }));

  test("should send message to sender if recipient disconnect", () =>
    new Promise<void>((done) => {
      const senderWs = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);

      const recipientWs = new WebSocket(
        `ws://localhost:${SERVER_PORT}/real-time`,
      );

      const senderClient = WebSocket.createWebSocketStream(senderWs);
      const recipientClient = WebSocket.createWebSocketStream(recipientWs);
      let doneInitializations = 0;
      const onInit = () =>
        doneInitializations === 2 &&
        senderClient.write(
          JSON.stringify({
            type: "TEXT",
            userId: testUser.id,
            conversationId: testConversation.id,
            content: "Message",
          } as IncomeMessage),
        );

      senderClient.write(
        JSON.stringify({
          type: "INIT",
          userId: testUser.id,
        } as IncomeMessage),
      );

      recipientClient.write(
        JSON.stringify({
          type: "INIT",
          userId: secondTestUser.id,
        } as IncomeMessage),
      );

      senderClient.on("data", (chunk: Buffer) => {
        const res = JSON.parse(chunk.toString()) as OutcomeMessage;
        if (res.type === "INIT") {
          doneInitializations += 1;
          expect(res).toStrictEqual({
            userId: SERVER_USER_ID,
            type: "INIT",
            status: "OK",
          } as OutcomeMessage);

          onInit();
        } else {
          expect(res).toStrictEqual({
            userId: testUser.id,
            type: "TEXT",
            conversationId: testConversation.id,
            content: "Message",
            status: "OK",
          } as OutcomeMessage);

          senderWs.close();
          done();
        }
      });

      recipientClient.on("data", (chunk: Buffer) => {
        const res = JSON.parse(chunk.toString());
        if (res.type === "INIT") {
          doneInitializations += 1;
          expect(res).toStrictEqual({
            userId: SERVER_USER_ID,
            type: "INIT",
            status: "OK",
          } as OutcomeMessage);

          onInit();
          recipientWs.close();
        }
      });
    }));

  test("should respond message to recipient if sender disconnect", () =>
    new Promise<void>((done) => {
      const senderWs = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
      const recipientWs = new WebSocket(
        `ws://localhost:${SERVER_PORT}/real-time`,
      );
      const senderClient = WebSocket.createWebSocketStream(senderWs);
      const recipientClient = WebSocket.createWebSocketStream(recipientWs);
      let doneInitializations = 0;
      const onInit = () => {
        if (doneInitializations === 2) {
          senderClient.write(
            JSON.stringify({
              type: "TEXT",
              userId: testUser.id,
              conversationId: testConversation.id,
              content: "Message",
            } as IncomeMessage),
          );

          senderWs.close();
        }
      };

      senderClient.write(
        JSON.stringify({
          type: "INIT",
          userId: testUser.id,
        } as IncomeMessage),
      );

      recipientClient.write(
        JSON.stringify({
          type: "INIT",
          userId: secondTestUser.id,
        } as IncomeMessage),
      );

      senderClient.on("data", (chunk: Buffer) => {
        const res = JSON.parse(chunk.toString()) as OutcomeMessage;
        if (res.type === "INIT") {
          doneInitializations += 1;
          expect(res).toStrictEqual({
            userId: SERVER_USER_ID,
            type: "INIT",
            status: "OK",
          } as OutcomeMessage);

          onInit();
        }
      });

      recipientClient.on("data", (chunk: Buffer) => {
        const res = JSON.parse(chunk.toString());
        if (res.type === "INIT") {
          doneInitializations += 1;
          expect(res).toStrictEqual({
            userId: SERVER_USER_ID,
            type: "INIT",
            status: "OK",
          } as OutcomeMessage);

          onInit();
        } else {
          expect(res).toStrictEqual({
            userId: testUser.id,
            conversationId: testConversation.id,
            type: "TEXT",
            content: "Message",
            status: "OK",
          } as OutcomeMessage);

          senderWs.close();
          recipientWs.close();
          done();
        }
      });
    }));

  test("should respond message to sender with status ERROR if conversationId is not provided", () =>
    new Promise<void>((done) => {
      const senderWs = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
      const senderClient = WebSocket.createWebSocketStream(senderWs);
      senderClient.write(
        JSON.stringify({
          type: "INIT",
          userId: testUser.id,
        } as IncomeMessage),
      );

      senderClient.on("data", (chunk: Buffer) => {
        const res = JSON.parse(chunk.toString()) as OutcomeMessage;
        if (res.type === "INIT") {
          expect(res).toStrictEqual({
            userId: SERVER_USER_ID,
            type: "INIT",
            status: "OK",
          } as OutcomeMessage);

          senderClient.write(
            JSON.stringify({
              userId: testUser.id,
              type: "TEXT",
              content: "Message",
            } as IncomeMessage),
          );
        } else {
          expect(res).toStrictEqual({
            userId: SERVER_USER_ID,
            type: "TEXT",
            status: "ERROR",
          } as OutcomeMessage);

          senderWs.close();
          done();
        }
      });
    }));

  test("should respond message to sender with status ERROR if content is not provided", () =>
    new Promise<void>((done) => {
      const senderWs = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
      const senderClient = WebSocket.createWebSocketStream(senderWs);
      senderClient.write(
        JSON.stringify({
          type: "INIT",
          userId: testUser.id,
        } as IncomeMessage),
      );

      senderClient.on("data", (chunk: Buffer) => {
        const res = JSON.parse(chunk.toString()) as OutcomeMessage;
        if (res.type === "INIT") {
          expect(res).toStrictEqual({
            userId: SERVER_USER_ID,
            type: "INIT",
            status: "OK",
          } as OutcomeMessage);

          senderClient.write(
            JSON.stringify({
              type: "TEXT",
              userId: testUser.id,
              conversationId: testConversation.id,
            } as IncomeMessage),
          );
        } else {
          expect(res).toStrictEqual({
            userId: SERVER_USER_ID,
            type: "TEXT",
            status: "ERROR",
          } as OutcomeMessage);

          senderWs.close();
          done();
        }
      });
    }));

  test("should write messages to database after 100 cached messages", () =>
    new Promise<void>((done) => {
      fastify.cache.keys("messages-stack*").then((keys) => {
        fastify.cache.del(...(keys.length ? keys : [""])).then(() => {
          const senderWs = new WebSocket(
            `ws://localhost:${SERVER_PORT}/real-time`,
          );

          const senderClient = WebSocket.createWebSocketStream(senderWs);
          senderClient.write(
            JSON.stringify({
              type: "INIT",
              userId: testUser.id,
            } as IncomeMessage),
          );

          const message = uuidv4();

          fastify.messagesStackWorker.on("completed", () => {
            fastify.prisma.message
              .findMany({
                where: {
                  conversationId: testConversation.id,
                  content: message,
                },
              })
              .then((messages) => {
                expect(messages).toHaveLength(100);
                senderWs.close();
                done();
              });
          });

          senderClient.on("data", async (chunk: Buffer) => {
            const res = JSON.parse(chunk.toString()) as OutcomeMessage;
            if (res.type === "INIT") {
              for (let i = 1; i <= 100; i += 1) {
                senderClient.write(
                  JSON.stringify({
                    type: "TEXT",
                    userId: testUser.id,
                    conversationId: testConversation.id,
                    content: message,
                  } as IncomeMessage),
                );

                // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
                await new Promise((r) => setTimeout(r, 100));
              }
            }
          });
        });
      });
    }));
});

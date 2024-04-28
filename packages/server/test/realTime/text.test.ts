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

import build from "@/app";

import { FASTIFY_SERVER_PORT_BASE } from "@test/utils/consts";
import authorize, {
  loadTestUserFromDB,
  testUsersCredientials,
} from "@test/utils/authorize";

import type { FastifyInstance } from "fastify";
import type {
  IncomeMessage,
  OutcomeMessage,
} from "@highland-cattle-chat/shared";
import type { Prisma, User } from "@prisma/client";

describe("Websocket real-time route - Message type TEXT", () => {
  const SERVER_PORT = FASTIFY_SERVER_PORT_BASE + 3;

  let fastify: FastifyInstance;
  let testUser: User;
  let firstAuthHeader: string;
  let secondAuthHeader: string;
  let testConversation: Prisma.ConversationGetPayload<{
    include: {
      participants: true;
    };
  }>;

  beforeEach(async () => {
    fastify = await build();
    await fastify.listen({ port: SERVER_PORT });

    testUser = await loadTestUserFromDB("JOHN", fastify);
    firstAuthHeader = await authorize("JOHN", fastify);
    secondAuthHeader = await authorize("MIKE", fastify);
  });

  afterEach(async () => {
    await fastify.close();
  });

  beforeAll(async () => {
    fastify = await build();
    testConversation = await fastify.prisma.conversation.findFirstOrThrow({
      where: {
        participants: {
          some: {
            user: {
              email: testUsersCredientials.JOHN.email,
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
      const senderWs = new WebSocket(
        `ws://localhost:${SERVER_PORT}/real-time`,
        {
          headers: {
            cookie: firstAuthHeader,
          },
        },
      );

      const recipientWs = new WebSocket(
        `ws://localhost:${SERVER_PORT}/real-time`,
        {
          headers: {
            cookie: secondAuthHeader,
          },
        },
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
            conversationId: testConversation.id,
            content: "Message",
          } as IncomeMessage),
        );

      senderClient.write(
        JSON.stringify({
          type: "INIT",
        } as IncomeMessage),
      );

      recipientClient.write(
        JSON.stringify({
          type: "INIT",
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
            type: "INIT",
            status: "OK",
          } as OutcomeMessage);

          onInit();
        } else {
          receivedText += 1;
          expect(res).toStrictEqual({
            type: "TEXT",
            conversationId: testConversation.id,
            content: "Message",
            status: "OK",
            userId: testUser.id,
          } as OutcomeMessage);

          onEnd();
        }
      });

      recipientClient.on("data", (chunk: Buffer) => {
        const res = JSON.parse(chunk.toString());
        if (res.type === "INIT") {
          doneInitializations += 1;
          expect(res).toStrictEqual({
            type: "INIT",
            status: "OK",
          } as OutcomeMessage);

          onInit();
        } else {
          receivedText += 1;
          expect(res).toStrictEqual({
            type: "TEXT",
            conversationId: testConversation.id,
            content: "Message",
            status: "OK",
            userId: testUser.id,
          } as OutcomeMessage);

          onEnd();
        }
      });
    }));

  test("should send message to sender if recipient disconnect", () =>
    new Promise<void>((done) => {
      const senderWs = new WebSocket(
        `ws://localhost:${SERVER_PORT}/real-time`,
        {
          headers: {
            cookie: firstAuthHeader,
          },
        },
      );

      const recipientWs = new WebSocket(
        `ws://localhost:${SERVER_PORT}/real-time`,
        {
          headers: {
            cookie: secondAuthHeader,
          },
        },
      );

      const senderClient = WebSocket.createWebSocketStream(senderWs);
      const recipientClient = WebSocket.createWebSocketStream(recipientWs);
      let doneInitializations = 0;
      const onInit = () =>
        doneInitializations === 2 &&
        senderClient.write(
          JSON.stringify({
            type: "TEXT",
            conversationId: testConversation.id,
            content: "Message",
          } as IncomeMessage),
        );

      senderClient.write(
        JSON.stringify({
          type: "INIT",
        } as IncomeMessage),
      );

      recipientClient.write(
        JSON.stringify({
          type: "INIT",
        } as IncomeMessage),
      );

      senderClient.on("data", (chunk: Buffer) => {
        const res = JSON.parse(chunk.toString()) as OutcomeMessage;
        if (res.type === "INIT") {
          doneInitializations += 1;
          expect(res).toStrictEqual({
            type: "INIT",
            status: "OK",
          } as OutcomeMessage);

          onInit();
        } else {
          expect(res).toStrictEqual({
            type: "TEXT",
            conversationId: testConversation.id,
            content: "Message",
            status: "OK",
            userId: testUser.id,
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
      const senderWs = new WebSocket(
        `ws://localhost:${SERVER_PORT}/real-time`,
        {
          headers: {
            cookie: firstAuthHeader,
          },
        },
      );
      const recipientWs = new WebSocket(
        `ws://localhost:${SERVER_PORT}/real-time`,
        {
          headers: {
            cookie: secondAuthHeader,
          },
        },
      );
      const senderClient = WebSocket.createWebSocketStream(senderWs);
      const recipientClient = WebSocket.createWebSocketStream(recipientWs);
      let doneInitializations = 0;
      const onInit = () => {
        if (doneInitializations === 2) {
          senderClient.write(
            JSON.stringify({
              type: "TEXT",
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
        } as IncomeMessage),
      );

      recipientClient.write(
        JSON.stringify({
          type: "INIT",
        } as IncomeMessage),
      );

      senderClient.on("data", (chunk: Buffer) => {
        const res = JSON.parse(chunk.toString()) as OutcomeMessage;
        if (res.type === "INIT") {
          doneInitializations += 1;
          expect(res).toStrictEqual({
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
            type: "INIT",
            status: "OK",
          } as OutcomeMessage);

          onInit();
        } else {
          expect(res).toStrictEqual({
            conversationId: testConversation.id,
            type: "TEXT",
            content: "Message",
            status: "OK",
            userId: testUser.id,
          } as OutcomeMessage);

          senderWs.close();
          recipientWs.close();
          done();
        }
      });
    }));

  test("should respond message to sender with status ERROR if conversationId is not provided", () =>
    new Promise<void>((done) => {
      const senderWs = new WebSocket(
        `ws://localhost:${SERVER_PORT}/real-time`,
        {
          headers: {
            cookie: firstAuthHeader,
          },
        },
      );

      const senderClient = WebSocket.createWebSocketStream(senderWs);
      senderClient.write(
        JSON.stringify({
          type: "INIT",
        } as IncomeMessage),
      );

      senderClient.on("data", (chunk: Buffer) => {
        const res = JSON.parse(chunk.toString()) as OutcomeMessage;
        if (res.type === "INIT") {
          expect(res).toStrictEqual({
            type: "INIT",
            status: "OK",
          } as OutcomeMessage);

          senderClient.write(
            JSON.stringify({
              type: "TEXT",
              content: "Message",
            } as IncomeMessage),
          );
        } else {
          expect(res).toStrictEqual({
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
      const senderWs = new WebSocket(
        `ws://localhost:${SERVER_PORT}/real-time`,
        {
          headers: {
            cookie: firstAuthHeader,
          },
        },
      );
      const senderClient = WebSocket.createWebSocketStream(senderWs);
      senderClient.write(
        JSON.stringify({
          type: "INIT",
        } as IncomeMessage),
      );

      senderClient.on("data", (chunk: Buffer) => {
        const res = JSON.parse(chunk.toString()) as OutcomeMessage;
        if (res.type === "INIT") {
          expect(res).toStrictEqual({
            type: "INIT",
            status: "OK",
          } as OutcomeMessage);

          senderClient.write(
            JSON.stringify({
              type: "TEXT",
              conversationId: testConversation.id,
            } as IncomeMessage),
          );
        } else {
          expect(res).toStrictEqual({
            type: "TEXT",
            status: "ERROR",
          } as OutcomeMessage);

          senderWs.close();
          done();
        }
      });
    }));
});

import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { v4 as uuidv4 } from "uuid";

import authorize from "@test/utils/authorize";
import buildForTests from "@test/utils/buildForTests";

import generateKeysForTests from "@test/utils/generateKeysForTests";

import generateString from "@test/utils/randomString";

import type { Prisma } from "@prisma/client";

import type { TestKeyPair } from "@test/utils/generateKeysForTests";

describe("REST API - /load-conversation", () => {
  const fastify = buildForTests();
  let pgpTestKey: TestKeyPair;
  let testUser: Prisma.UserUncheckedCreateInput;
  let secondTestUser: Prisma.UserUncheckedCreateInput;
  let testConversation: any;

  beforeAll(async () => {
    pgpTestKey = await generateKeysForTests();
    buildForTests();
  });

  afterAll(async () => {
    await fastify.close();
  });

  beforeEach(async () => {
    testUser = await fastify.prisma.user.create({
      data: {
        displayName: "John",
        login: "john",
        publicKey: Buffer.from(pgpTestKey.publicKey).toString("base64"),
      },
    });

    secondTestUser = await fastify.prisma.user.create({
      data: {
        displayName: "Mike",
        login: "mike",
        publicKey: Buffer.from(pgpTestKey.publicKey).toString("base64"),
      },
    });

    await fastify.prisma.user.create({
      data: {
        displayName: "Zapp",
        login: "zapp",
        publicKey: Buffer.from(pgpTestKey.publicKey).toString("base64"),
      },
    });

    testConversation = await fastify.prisma.conversation.create({
      data: {
        title: uuidv4(),
        image: "https://picsum.photos/200",
        participants: {
          create: [
            {
              userId: testUser.id ?? "",
            },
            {
              userId: secondTestUser.id ?? "",
            },
          ],
        },
        messages: {
          create: [...Array(10)].map(() => ({
            content: generateString(Math.ceil(Math.random() * 5)),
            user: {
              connect: {
                id: Math.random() > 0.5 ? testUser.id : secondTestUser.id,
              },
            },
          })),
        },
      },
      include: {
        messages: true,
        participants: true,
      },
    });
  });

  afterEach(async () => {
    const res = await fastify.prisma.$runCommandRaw({
      listCollections: 1,
      nameOnly: true,
    });

    // @ts-ignore
    res.cursor?.firstBatch?.forEach(async (collectionJson) => {
      await fastify.prisma.$runCommandRaw({
        drop: collectionJson.name,
      });
    });
  });

  test("should respond with status 200 and last 100 messages", async () => {
    const authHeader = await authorize(
      pgpTestKey.privateKey,
      pgpTestKey.passphrase,
      "john",
      fastify,
    );

    const response = await fastify.inject({
      method: "GET",
      url: "/load-conversation",
      headers: {
        cookie: authHeader,
      },
      query: {
        id: testConversation.id ?? "",
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    testConversation.messages.forEach(
      (message: Prisma.MessageUncheckedCreateInput) => {
        expect(body).toContainEqual({
          id: message.id,
          userId: message.userId,
          conversationId: testConversation.id,
          content: message.content,
          createdAt:
            message.createdAt instanceof Date
              ? message.createdAt.toISOString()
              : message.createdAt,
        });
      },
    );
  });

  test("should respond with status 200 and last 10 messages", async () => {
    const authHeader = await authorize(
      pgpTestKey.privateKey,
      pgpTestKey.passphrase,
      "john",
      fastify,
    );

    const response = await fastify.inject({
      method: "GET",
      url: "/load-conversation",
      headers: {
        cookie: authHeader,
      },
      query: {
        id: testConversation.id,
        limit: "10",
      },
    });

    const body = response.json();
    expect(response.statusCode).toBe(200);

    testConversation.messages.forEach(
      async (message: Prisma.MessageUncheckedCreateInput) => {
        expect(body).toContainEqual({
          id: message.id,
          userId: message.userId,
          conversationId: testConversation.id,
          content: message.content,
          createdAt:
            message.createdAt instanceof Date
              ? message.createdAt.toISOString()
              : message.createdAt,
        });
      },
    );
  });

  test("should respond with status 403 when user isn't participate in conversation", async () => {
    const authHeader = await authorize(
      pgpTestKey.privateKey,
      pgpTestKey.passphrase,
      "zapp",
      fastify,
    );

    const response = await fastify.inject({
      method: "GET",
      url: "/load-conversation",
      headers: {
        cookie: authHeader,
      },
      query: {
        id: testConversation.id,
      },
    });

    expect(response.statusCode).toBe(403);
  });

  test("should respond with status 403 when auth cookie is missing", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: "/load-conversation",
      query: {
        id: testConversation.id,
      },
    });

    expect(response.statusCode).toBe(403);
  });

  test("should respond with status 403 when auth cookie contains random string", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: "/load-conversation",
      headers: {
        cookie: `session=abcd`,
      },
      query: {
        id: testConversation.id,
      },
    });

    expect(response.statusCode).toBe(403);
  });

  test("should respond with status 400 when id query string is missing", async () => {
    const authHeader = await authorize(
      pgpTestKey.privateKey,
      pgpTestKey.passphrase,
      "john",
      fastify,
    );

    const response = await fastify.inject({
      method: "GET",
      url: "/load-conversation",
      headers: {
        cookie: authHeader,
      },
    });

    expect(response.statusCode).toBe(400);
  });
});

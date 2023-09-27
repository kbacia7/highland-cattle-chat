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

import generateString from "@test/utils/randomString";

import type { Prisma } from "@prisma/client";

describe("REST API - /load-conversation", () => {
  const fastify = buildForTests();
  let testUser: Prisma.UserUncheckedCreateInput;
  let secondTestUser: Prisma.UserUncheckedCreateInput;
  let testConversation: any;

  beforeAll(async () => {
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
      },
    });

    secondTestUser = await fastify.prisma.user.create({
      data: {
        displayName: "Mike",
        login: "mike",
      },
    });

    await fastify.prisma.user.create({
      data: {
        displayName: "Zapp",
        login: "zapp",
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
        participants: {
          include: {
            user: true,
          },
        },
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
    const authHeader = await authorize("john", fastify);
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

    const body = response.json();
    expect(response.statusCode).toBe(200);
    expect(body).toEqual({
      image: testConversation.image,
      participants: testConversation.participants.map((participant: any) => ({
        user: {
          id: participant.user.id,
          displayName: participant.user.displayName,
        },
      })),
      messages: testConversation.messages.map(
        (message: Prisma.MessageUncheckedCreateInput) => ({
          id: message.id,
          userId: message.userId,
          content: message.content,
          createdAt:
            message.createdAt instanceof Date
              ? message.createdAt.toISOString()
              : message.createdAt,
        }),
      ),
    });
  });

  test("should respond with status 200 and last 10 messages", async () => {
    const authHeader = await authorize("john", fastify);
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
    expect(body).toEqual({
      image: testConversation.image,
      participants: testConversation.participants.map((participant: any) => ({
        user: {
          id: participant.user.id,
          displayName: participant.user.displayName,
        },
      })),
      messages: testConversation.messages.map(
        (message: Prisma.MessageUncheckedCreateInput) => ({
          id: message.id,
          userId: message.userId,
          content: message.content,
          createdAt:
            message.createdAt instanceof Date
              ? message.createdAt.toISOString()
              : message.createdAt,
        }),
      ),
    });
  });

  test("should respond with status 403 when user isn't participate in conversation", async () => {
    const authHeader = await authorize("zapp", fastify);
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
    const authHeader = await authorize("john", fastify);
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

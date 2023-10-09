import { describe, test, expect, afterAll, beforeAll } from "@jest/globals";

import authorize from "@test/utils/authorize";
import buildForTests from "@test/utils/buildForTests";

import type { Prisma } from "@prisma/client";

describe("REST API - /load-conversation", () => {
  const fastify = buildForTests();
  let testConversation: any;

  afterAll(async () => {
    await fastify.close();
  });

  beforeAll(async () => {
    testConversation = await fastify.prisma.conversation.findFirstOrThrow({
      where: {
        participants: {
          some: {
            user: {
              login: "john",
            },
          },
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

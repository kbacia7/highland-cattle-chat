import { describe, test, expect, afterAll, beforeAll } from "vitest";

import build from "@/app";
import authorize from "@test/utils/authorize";

import type { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";

describe("REST API - /load-conversation", () => {
  let fastify: FastifyInstance;
  let testConversation: Prisma.ConversationGetPayload<{
    include: {
      messages: true;
      participants: {
        include: {
          user: true;
        };
      };
    };
  }>;

  afterAll(async () => {
    await fastify.close();
  });

  beforeAll(async () => {
    fastify = await build();
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
    const authHeader = await authorize("JOHN", fastify);
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
    const count = await fastify.prisma.message.count({
      where: {
        conversationId: testConversation.id ?? "",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(body).toEqual({
      count,
      participants: testConversation.participants.map((participant: any) => ({
        user: {
          id: participant.user.id,
          displayName: participant.user.displayName,
          image: participant.user.image,
        },
      })),
      messages: testConversation.messages
        .slice(0, 100)
        .reverse()
        .map((message: Prisma.MessageUncheckedCreateInput) => ({
          id: message.id,
          userId: message.userId,
          attachment: message.attachment,
          content: message.content,
          createdAt:
            message.createdAt instanceof Date
              ? message.createdAt.toISOString()
              : message.createdAt,
        })),
    });
  });

  test("should respond with status 200 and last 10 messages", async () => {
    const authHeader = await authorize("JOHN", fastify);
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
    const count = await fastify.prisma.message.count({
      where: {
        conversationId: testConversation.id ?? "",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(body).toEqual({
      count,
      participants: testConversation.participants.map((participant: any) => ({
        user: {
          id: participant.user.id,
          displayName: participant.user.displayName,
          image: participant.user.image,
        },
      })),
      messages: testConversation.messages
        .slice(0, 10)
        .reverse()
        .map((message: Prisma.MessageUncheckedCreateInput) => ({
          attachment: message.attachment,
          id: message.id,
          userId: message.userId,
          content: message.content,
          createdAt:
            message.createdAt instanceof Date
              ? message.createdAt.toISOString()
              : message.createdAt,
        })),
    });
  });

  test("should respond with status 403 when user isn't participate in conversation", async () => {
    const authHeader = await authorize("ZAPP", fastify);
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
    const authHeader = await authorize("JOHN", fastify);
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

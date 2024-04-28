import { describe, test, expect, beforeAll, afterAll } from "vitest";

import build from "@/app";
import authorize from "@test/utils/authorize";

import type { LoadConversationsResponse } from "@highland-cattle-chat/shared";

import type { FastifyInstance } from "fastify";
import type { User } from "@prisma/client";

describe("REST API - /load-conversations", () => {
  let fastify: FastifyInstance;
  let testConversations: LoadConversationsResponse;
  let johnTestUser: User;

  beforeAll(async () => {
    fastify = await build();

    johnTestUser = await fastify.prisma.user.findFirstOrThrow({
      where: {
        email: "john@example.com",
      },
    });

    testConversations = await fastify.prisma.conversation.findMany({
      include: {
        participants: {
          select: {
            user: {
              select: {
                id: true,
                image: true,
                displayName: true,
                online: true,
              },
            },
          },
          take: 1,
          where: {
            userId: {
              not: johnTestUser.id,
            },
          },
        },
        messages: {
          select: {
            content: true,
            userId: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      where: {
        participants: {
          some: {
            user: {
              email: "john@example.com",
            },
          },
        },
      },
    });

    testConversations = testConversations.sort((a, b) => {
      const lastMessageA = a.messages[0];
      const lastMessageB = b.messages[0];

      if (lastMessageA && lastMessageB)
        return (
          lastMessageB.createdAt.valueOf() - lastMessageA.createdAt.valueOf()
        );
      return 0;
    });
  });

  afterAll(async () => {
    await fastify.close();
  });

  test("should respond with status 200 and user conversations", async () => {
    const authHeader = await authorize(
      "john@example.com",
      "password-john",
      fastify,
    );

    const response = await fastify.inject({
      method: "GET",
      url: "/load-conversations",
      headers: {
        cookie: authHeader,
      },
    });

    const body = response.json();
    expect(response.statusCode).toBe(200);
    expect(testConversations.length).toBeGreaterThan(0);

    testConversations.forEach((conversation) => {
      expect(body).toContainEqual(
        JSON.parse(
          JSON.stringify({
            id: conversation.id,
            messages: conversation.messages,
            participants: conversation.participants,
            createdAt:
              conversation.createdAt instanceof Date
                ? conversation.createdAt.toISOString()
                : conversation.createdAt,
          }),
        ),
      );
    });
  });

  test("should respond with status 403 when auth cookie is missing", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: "/load-conversations",
    });

    expect(response.statusCode).toBe(403);
  });

  test("should respond with status 403 when auth cookie contains random string", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: "/load-conversations",
      headers: {
        cookie: `session=abcd`,
      },
    });

    expect(response.statusCode).toBe(403);
  });
});

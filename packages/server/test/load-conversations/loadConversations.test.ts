import { describe, test, expect, beforeAll, afterAll } from "vitest";

import authorize from "@test/utils/authorize";
import buildForTests from "@test/utils/buildForTests";

import type { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";

describe("REST API - /load-conversations", () => {
  let fastify: FastifyInstance;
  let testConversations: Prisma.ConversationGetPayload<{
    include: {
      participants: {
        include: {
          user: true;
        };
      };
    };
  }>[] = [];

  beforeAll(async () => {
    fastify = await buildForTests();
    testConversations = await fastify.prisma.conversation.findMany({
      include: {
        participants: {
          include: {
            user: true,
          },
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
      expect(body).toContainEqual({
        id: conversation.id,
        participants: conversation.participants.map((p) => ({
          user: {
            id: p.user.id,
            image: p.user.image,
          },
        })),
        title: conversation.title,
        createdAt:
          conversation.createdAt instanceof Date
            ? conversation.createdAt.toISOString()
            : conversation.createdAt,
      });
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

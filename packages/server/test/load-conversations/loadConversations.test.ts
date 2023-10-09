import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";

import authorize from "@test/utils/authorize";
import buildForTests from "@test/utils/buildForTests";

import type { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";

describe("REST API - /load-conversations", () => {
  const fastify: FastifyInstance = buildForTests();

  let testConversations: Prisma.ConversationUncheckedCreateInput[] = [];

  beforeAll(async () => {
    testConversations = await fastify.prisma.conversation.findMany();
  });

  afterAll(async () => {
    await fastify.close();
  });

  test("should respond with status 200 and user conversations", async () => {
    const authHeader = await authorize("john", fastify);
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
    testConversations.forEach(async (conversation) => {
      expect(body).toContainEqual({
        id: conversation.id,
        image: conversation.image,
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

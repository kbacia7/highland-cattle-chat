import { describe, test, expect, afterAll, beforeAll } from "vitest";

import build from "@/app";
import authorize, { loadTestUserFromDB } from "@test/utils/authorize";

import type { FastifyInstance } from "fastify";
import type { User } from "@prisma/client";

describe("REST API - /create-conversation", () => {
  let fastify: FastifyInstance;
  let johnTestUser: User;
  let mikeTestUser: User;
  let zappTestUser: User;

  afterAll(async () => {
    await fastify.close();
  });

  beforeAll(async () => {
    fastify = await build();
    johnTestUser = await loadTestUserFromDB("JOHN", fastify);
    mikeTestUser = await loadTestUserFromDB("MIKE", fastify);
    zappTestUser = await loadTestUserFromDB("ZAPP", fastify);
  });

  test("should respond with status 200 and id of conversation", async () => {
    const authHeader = await authorize("JOHN", fastify);
    const response = await fastify.inject({
      method: "POST",
      url: "/create-conversation",
      headers: {
        cookie: authHeader,
      },
      body: {
        id: zappTestUser.id,
      },
    });

    const body = response.json();
    const newConversation = await fastify.prisma.conversation.findFirstOrThrow({
      where: {
        participants: {
          some: {
            userId: zappTestUser.id,
          },
        },
      },
    });

    expect(response.statusCode).toBe(200);
    expect(body).toEqual({
      id: newConversation.id,
    });
  });

  test("should respond with status 400 when user id is equal to current user id", async () => {
    const authHeader = await authorize("JOHN", fastify);
    const response = await fastify.inject({
      method: "POST",
      url: "/create-conversation",
      headers: {
        cookie: authHeader,
      },
      body: {
        id: johnTestUser.id,
      },
    });

    expect(response.statusCode).toBe(400);
  });

  test("should respond with status 400 when user have conversation yet", async () => {
    const authHeader = await authorize("JOHN", fastify);
    const response = await fastify.inject({
      method: "POST",
      url: "/create-conversation",
      headers: {
        cookie: authHeader,
      },
      body: {
        id: mikeTestUser.id,
      },
    });

    expect(response.statusCode).toBe(400);
  });

  test("should respond with status 400 when user with given id does not exist", async () => {
    const authHeader = await authorize("JOHN", fastify);
    const response = await fastify.inject({
      method: "POST",
      url: "/create-conversation",
      headers: {
        cookie: authHeader,
      },
      body: {
        id: "aaaaaaaaaaaaaaaaaaaaaaaa",
      },
    });

    expect(response.statusCode).toBe(400);
  });

  test("should respond with status 400 when id isn't correct ObjectId", async () => {
    const authHeader = await authorize("JOHN", fastify);
    const response = await fastify.inject({
      method: "POST",
      url: "/create-conversation",
      headers: {
        cookie: authHeader,
      },
      body: {
        id: "abc",
      },
    });

    expect(response.statusCode).toBe(400);
  });

  test("should respond with status 400 when id is missing", async () => {
    const authHeader = await authorize("JOHN", fastify);
    const response = await fastify.inject({
      method: "POST",
      url: "/create-conversation",
      headers: {
        cookie: authHeader,
      },
    });

    expect(response.statusCode).toBe(400);
  });
});

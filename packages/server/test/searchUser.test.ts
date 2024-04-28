import { describe, test, expect, afterAll, beforeAll } from "vitest";

import build from "@/app";
import authorize from "@test/utils/authorize";

import type { FastifyInstance } from "fastify";
import type { User } from "@prisma/client";

describe("REST API - /search-user", () => {
  let fastify: FastifyInstance;
  let testUser: User;

  afterAll(async () => {
    await fastify.close();
  });

  beforeAll(async () => {
    fastify = await build();
    testUser = await fastify.prisma.user.findFirstOrThrow({
      where: {
        email: "zapp@example.com",
      },
    });
  });

  test("should respond with status 200 and user when phrase is full display name", async () => {
    const authHeader = await authorize("JOHN", fastify);
    const response = await fastify.inject({
      method: "GET",
      url: "/search-user",
      headers: {
        cookie: authHeader,
      },
      query: {
        phrase: "Zapp",
      },
    });

    const body = response.json();
    expect(response.statusCode).toBe(200);
    expect(body).toEqual([
      {
        id: testUser.id,
        displayName: testUser.displayName,
        image: testUser.image,
      },
    ]);
  });

  test("should respond with status 200 and user when phrase is part of display name", async () => {
    const authHeader = await authorize("JOHN", fastify);

    const response = await fastify.inject({
      method: "GET",
      url: "/search-user",
      headers: {
        cookie: authHeader,
      },
      query: {
        phrase: "app",
      },
    });

    const body = response.json();
    expect(response.statusCode).toBe(200);
    expect(body).toEqual([
      {
        id: testUser.id,
        displayName: testUser.displayName,
        image: testUser.image,
      },
    ]);
  });

  test("should respond with status 200 and empty array when try to search for user who already have conversation with current user", async () => {
    const authHeader = await authorize("JOHN", fastify);
    const response = await fastify.inject({
      method: "GET",
      url: "/search-user",
      headers: {
        cookie: authHeader,
      },
      query: {
        phrase: "Mike",
      },
    });

    const body = response.json();
    expect(response.statusCode).toBe(200);
    expect(body).toEqual([]);
  });

  test("should respond with status 200 and empty array when try to search for current user", async () => {
    const authHeader = await authorize("JOHN", fastify);
    const response = await fastify.inject({
      method: "GET",
      url: "/search-user",
      headers: {
        cookie: authHeader,
      },
      query: {
        phrase: "John",
      },
    });

    const body = response.json();
    expect(response.statusCode).toBe(200);
    expect(body).toEqual([]);
  });

  test("should respond with status 400 when phrase string is missing", async () => {
    const authHeader = await authorize("JOHN", fastify);
    const response = await fastify.inject({
      method: "GET",
      url: "/search-user",
      headers: {
        cookie: authHeader,
      },
    });

    expect(response.statusCode).toBe(400);
  });

  test("should respond with status 400 when phrase string is too short (< 3)", async () => {
    const authHeader = await authorize("JOHN", fastify);
    const response = await fastify.inject({
      method: "GET",
      url: "/search-user",
      headers: {
        cookie: authHeader,
      },
      query: {
        phrase: "ke",
      },
    });

    expect(response.statusCode).toBe(400);
  });
});

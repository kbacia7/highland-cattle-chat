import { beforeAll, describe, test, expect, afterAll } from "vitest";

import buildForTests from "@test/utils/buildForTests";

import type { FastifyInstance } from "fastify";

describe("REST API - /register", () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = await buildForTests();
  });

  afterAll(async () => {
    await fastify.close();
  });

  test("should create user", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/register",
      body: {
        email: "test-register@example.com",
        password: "password-test-register",
        repeatPassword: "password-test-register",
        displayName: "Test Register",
      },
    });

    await fastify.prisma.user.findFirstOrThrow({
      where: {
        email: "test-register@example.com",
      },
    });

    expect(response.statusCode).toBe(200);
  });

  test("should respond with 403 if email already exists", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/register",
      body: {
        email: "john@example.com",
        password: "password-john",
        repeatPassword: "password-john",
        displayName: "John",
      },
    });

    expect(response.statusCode).toBe(403);
  });

  test("should respond with 400 if email isn't provided", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/register",
      body: {
        password: "password-test-register",
        repeatPassword: "password-test-register",
        displayName: "Test Register",
      },
    });

    expect(response.statusCode).toBe(400);
  });

  test("should respond with 400 if email isn't valid e-mail", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/register",
      body: {
        email: "test-registercom",
        password: "password-test-register",
        repeatPassword: "password-test-register",
        displayName: "Test Register",
      },
    });

    expect(response.statusCode).toBe(400);
  });

  test("should respond with 400 if password is too short (< 8 characters)", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/register",
      body: {
        email: "test-register2@example.com",
        password: "passw",
        repeatPassword: "passw",
        displayName: "Test Register",
      },
    });

    expect(response.statusCode).toBe(400);
  });

  test("should respond with 400 if displayName is invalid", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/register",
      body: {
        email: "test-register2@example.com",
        password: "password-test-register",
        repeatPassword: "password-test-register",
        displayName: "T",
      },
    });

    expect(response.statusCode).toBe(400);
  });

  test("should respond with 400 if password isn't provided", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/register",
      body: {
        email: "test-register2@example.com",
        displayName: "Test Register",
        repeatPassword: "password-test-register",
      },
    });

    expect(response.statusCode).toBe(400);
  });

  test("should respond with 400 if displayName isn't provided", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/register",
      body: {
        email: "test-register2@example.com",
        password: "password-test-register",
        repeatPassword: "password-test-register",
      },
    });

    expect(response.statusCode).toBe(400);
  });

  test("should respond with 400 if repeatPassword isn't provided", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/register",
      body: {
        email: "test-register2@example.com",
        password: "password-test-register",
        displayName: "Test Register",
      },
    });

    expect(response.statusCode).toBe(400);
  });
});

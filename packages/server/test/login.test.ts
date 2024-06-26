import jwt from "jsonwebtoken";
import { describe, test, expect, afterAll, beforeAll } from "vitest";
import fastifyCookie from "@fastify/cookie";

import build from "@/app";

import { loadTestUserFromDB, testUsersCredientials } from "./utils/authorize";

import type { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";
import type { JwtPayload } from "jsonwebtoken";

describe("REST API - /login", () => {
  let fastify: FastifyInstance;
  let testUser: Prisma.UserUncheckedCreateInput;

  beforeAll(async () => {
    fastify = await build();
    testUser = await loadTestUserFromDB("JOHN", fastify);
  });

  afterAll(async () => {
    await fastify.close();
  });

  test("should respond cookie with JWT token", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/login",
      body: testUsersCredientials.JOHN,
    });

    const session = await fastify.prisma.session.findFirst({
      where: {
        userId: testUser.id,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    expect(session).toBeTruthy();

    const cookie = response.cookies.find(({ name }) => name === "session");
    expect(cookie?.value).toBeTruthy();

    const cookieValue = JSON.parse(
      fastifyCookie.unsign(cookie?.value ?? "", process.env.COOKIE_SECRET || "")
        .value ?? "",
    );

    const jwtPayload = jwt.verify(
      cookieValue.token,
      session?.secret ?? "",
    ) as JwtPayload;

    expect(cookieValue.userId).toBe(testUser.id);
    expect(jwtPayload.userId).toBe(testUser.id);
    expect(response.statusCode).toBe(200);
  });

  test("should respond with 403 without session when password is incorrect", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/login",
      body: {
        email: "johnfdsfsd@example.com",
        password: "1234567890",
      },
    });

    const cookie = response.cookies.find(({ name }) => name === "session");

    expect(cookie).toBeUndefined();
    expect(response.statusCode).toBe(403);
  });

  test("should respond with 403 without session when email is not user who exists", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/login",
      body: {
        email: "johnfdsfsd@example.com",
        password: "password-john",
      },
    });

    const cookie = response.cookies.find(({ name }) => name === "session");

    expect(cookie).toBeUndefined();
    expect(response.statusCode).toBe(403);
  });

  test("should respond with 400 without session when email is not provided", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/login",
      body: {
        password: "password-john",
      },
    });

    const cookie = response.cookies.find(({ name }) => name === "session");

    expect(cookie).toBeUndefined();
    expect(response.statusCode).toBe(400);
  });

  test("should respond with 400 without session when password is not provided", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/login",
      body: {
        email: testUsersCredientials.JOHN.email,
      },
    });

    const cookie = response.cookies.find(({ name }) => name === "session");

    expect(cookie).toBeUndefined();
    expect(response.statusCode).toBe(400);
  });

  test("should respond with 404 without session when try to use /login endpoint with GET", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: "/login",
      body: {
        email: "johnfdsfsd@example.com",
        password: "password-john",
      },
    });

    const cookie = response.cookies.find(({ name }) => name === "session");

    expect(cookie).toBeUndefined();
    expect(response.statusCode).toBe(404);
  });
});

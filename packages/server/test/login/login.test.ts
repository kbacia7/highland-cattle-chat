import jwt from "jsonwebtoken";
import { describe, test, expect, afterAll, beforeAll } from "@jest/globals";
import fastifyCookie from "@fastify/cookie";

import buildForTests from "@test/utils/buildForTests";
import { FAKE_COOKIE_SECRET } from "@test/utils/consts";

import type { Prisma } from "@prisma/client";
import type { JwtPayload } from "jsonwebtoken";

describe("REST API - /login", () => {
  const fastify = buildForTests();
  let testUser: Prisma.UserUncheckedCreateInput;

  afterAll(async () => {
    await fastify.close();
  });

  beforeAll(async () => {
    testUser = await fastify.prisma.user.findFirstOrThrow({
      where: {
        login: "john",
      },
    });
  });

  test("should respond cookie with JWT token", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/login",
      body: {
        alias: "john",
      },
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
      fastifyCookie.unsign(cookie?.value ?? "", FAKE_COOKIE_SECRET).value ?? "",
    );

    const jwtPayload = jwt.verify(
      cookieValue.token,
      session?.secret ?? "",
    ) as JwtPayload;

    expect(cookieValue.userId).toBe(testUser.id);
    expect(jwtPayload.userId).toBe(testUser.id);
    expect(response.statusCode).toBe(200);
  });

  test("should respond with 403 without session when alias is not user who exists", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/login",
      body: {
        alias: "abcd",
      },
    });

    expect(await fastify.prisma.session.count()).toBe(0);

    const cookie = response.cookies.find(({ name }) => name === "session");

    expect(cookie).toBeUndefined();
    expect(response.statusCode).toBe(403);
  });

  test("should respond with 400 without session when alias is not provided", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/login",
      body: {},
    });

    expect(await fastify.prisma.session.count()).toBe(0);

    const cookie = response.cookies.find(({ name }) => name === "session");

    expect(cookie).toBeUndefined();
    expect(response.statusCode).toBe(400);
  });

  test("should respond with 404 without session when try to use /login endpoint with GET", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: "/login",
      body: {
        alias: "john",
      },
    });

    const session = await fastify.prisma.session.findFirst({
      where: {
        userId: testUser.id,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    expect(session).toBeNull();

    const cookie = response.cookies.find(({ name }) => name === "session");

    expect(cookie).toBeUndefined();
    expect(response.statusCode).toBe(404);
  });
});

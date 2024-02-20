import crypto from "crypto";

import formAutoContent from "form-auto-content";
import { describe, test, expect, afterAll } from "@jest/globals";

import authorize from "@test/utils/authorize";

import buildForTests from "@test/utils/buildForTests";

const downloadImageFromUrl = async (url: string) => {
  const res = await fetch(url);
  const buff = Buffer.from(await res.arrayBuffer());

  return buff;
};

describe("REST API - /update-account", () => {
  const fastify = buildForTests();
  let randomImageBuff: Buffer;

  beforeAll(async () => {
    randomImageBuff = await downloadImageFromUrl("https://picsum.photos/200");
  });

  afterAll(async () => {
    await fastify.close();
  });

  test("should upload image and update account", async () => {
    const authHeader = await authorize(
      "john@example.com",
      "password-john",
      fastify,
    );

    const randomImageMD5 = crypto
      .createHash("md5")
      .update(randomImageBuff)
      .digest("hex");

    const form = formAutoContent({
      email: "test-update@example.com",
      password: "password-test-update",
      displayName: "Update acc",
      profilePicture: randomImageBuff,
    });

    const response = await fastify.inject({
      method: "POST",
      url: "/update-account",
      headers: {
        cookie: authHeader,
        ...form.headers,
      },
      payload: form.payload,
    });

    const updatedUser = await fastify.prisma.user.findFirstOrThrow({
      where: {
        email: "test-update@example.com",
      },
      select: {
        image: true,
      },
    });

    const imageFromStorageBuff = await downloadImageFromUrl(updatedUser.image);
    const imageFromStorageMD5 = crypto
      .createHash("md5")
      .update(imageFromStorageBuff)
      .digest("hex");

    expect(response.statusCode).toBe(200);
    expect(imageFromStorageMD5).toBe(randomImageMD5);
  });

  test("should respond with 403 if email is already taken", async () => {
    const authHeader = await authorize(
      "mike@example.com",
      "password-mike",
      fastify,
    );

    const form = formAutoContent({
      email: "test-update@example.com",
      password: "password-test-update",
      displayName: "Update acc",
      profilePicture: randomImageBuff,
    });

    const response = await fastify.inject({
      method: "POST",
      url: "/update-account",
      headers: {
        cookie: authHeader,
        ...form.headers,
      },
      payload: form.payload,
    });

    expect(response.statusCode).toBe(403);
  });

  test("should respond with 403 if file isn't correct type", async () => {
    const authHeader = await authorize(
      "mike@example.com",
      "password-mike",
      fastify,
    );

    const form = formAutoContent({
      email: "zapp@example.com",
      password: "password-test-update",
      displayName: "Update acc",
      profilePicture: Buffer.from("test"),
    });

    const response = await fastify.inject({
      method: "POST",
      url: "/update-account",
      headers: {
        cookie: authHeader,
        ...form.headers,
      },
      payload: form.payload,
    });

    expect(response.statusCode).toBe(400);
  });

  test("should respond with 400 if e-mail isn't correct email", async () => {
    const authHeader = await authorize(
      "mike@example.com",
      "password-mike",
      fastify,
    );

    const form = formAutoContent({
      email: "zappcom",
      password: "password-test-update",
      displayName: "Update acc",
      profilePicture: randomImageBuff,
    });

    const response = await fastify.inject({
      method: "POST",
      url: "/update-account",
      headers: {
        cookie: authHeader,
        ...form.headers,
      },
      payload: form.payload,
    });

    expect(response.statusCode).toBe(400);
  });

  test("should respond with 400 if password is too short (< 8 characters)", async () => {
    const authHeader = await authorize(
      "mike@example.com",
      "password-mike",
      fastify,
    );

    const form = formAutoContent({
      email: "abcdef@example.com",
      password: "1234",
      displayName: "Update acc",
      profilePicture: randomImageBuff,
    });

    const response = await fastify.inject({
      method: "POST",
      url: "/update-account",
      headers: {
        cookie: authHeader,
        ...form.headers,
      },
      payload: form.payload,
    });

    expect(response.statusCode).toBe(400);
  });

  test("should respond with 400 if display name isn't valid", async () => {
    const authHeader = await authorize(
      "mike@example.com",
      "password-mike",
      fastify,
    );

    const form = formAutoContent({
      email: "abcdef@example.com",
      password: "password-abcdef",
      displayName: "T",
      profilePicture: randomImageBuff,
    });

    const response = await fastify.inject({
      method: "POST",
      url: "/update-account",
      headers: {
        cookie: authHeader,
        ...form.headers,
      },
      payload: form.payload,
    });

    expect(response.statusCode).toBe(400);
  });

  test("should respond with 400 if e-mail isn't provided", async () => {
    const authHeader = await authorize(
      "mike@example.com",
      "password-mike",
      fastify,
    );

    const form = formAutoContent({
      password: "password-test-update",
      displayName: "Update acc",
      profilePicture: randomImageBuff,
    });

    const response = await fastify.inject({
      method: "POST",
      url: "/update-account",
      headers: {
        cookie: authHeader,
        ...form.headers,
      },
      payload: form.payload,
    });

    expect(response.statusCode).toBe(400);
  });

  test("should respond with 400 if password isn't provided", async () => {
    const authHeader = await authorize(
      "mike@example.com",
      "password-mike",
      fastify,
    );

    const form = formAutoContent({
      email: "abcdef@example.com",
      displayName: "Update acc",
      profilePicture: randomImageBuff,
    });

    const response = await fastify.inject({
      method: "POST",
      url: "/update-account",
      headers: {
        cookie: authHeader,
        ...form.headers,
      },
      payload: form.payload,
    });

    expect(response.statusCode).toBe(400);
  });

  test("should respond with 400 if display name isn't provided", async () => {
    const authHeader = await authorize(
      "mike@example.com",
      "password-mike",
      fastify,
    );

    const form = formAutoContent({
      email: "abcdef@example.com",
      password: "abcdefgtda",
      profilePicture: randomImageBuff,
    });

    const response = await fastify.inject({
      method: "POST",
      url: "/update-account",
      headers: {
        cookie: authHeader,
        ...form.headers,
      },
      payload: form.payload,
    });

    expect(response.statusCode).toBe(400);
  });

  test("should respond with 415 if profilePicture isn't provided", async () => {
    const authHeader = await authorize(
      "mike@example.com",
      "password-mike",
      fastify,
    );

    const form = formAutoContent({
      email: "abcdef@example.com",
      password: "abcdefgtda",
      displayName: "Update acc",
    });

    const response = await fastify.inject({
      method: "POST",
      url: "/update-account",
      headers: {
        cookie: authHeader,
        ...form.headers,
      },
      payload: form.payload,
    });

    expect(response.statusCode).toBe(415);
  });
});

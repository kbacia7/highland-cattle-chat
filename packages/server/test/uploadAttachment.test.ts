import crypto from "crypto";

import formAutoContent from "form-auto-content";
import { describe, test, expect, afterAll, beforeAll } from "vitest";

import build from "@/app";
import authorize from "@test/utils/authorize";

import type { FastifyInstance } from "fastify";

const downloadImageFromUrl = async (url: string) => {
  const res = await fetch(url);
  const buff = Buffer.from(await res.arrayBuffer());

  return buff;
};

describe("REST API - /upload-attachment", () => {
  let fastify: FastifyInstance;
  let randomImageBuff: Buffer;

  beforeAll(async () => {
    fastify = await build();
    randomImageBuff = await downloadImageFromUrl("https://picsum.photos/200");
  });

  afterAll(async () => {
    await fastify.close();
  });

  test("should upload image", async () => {
    const authHeader = await authorize("JOHN", fastify);
    const randomImageMD5 = crypto
      .createHash("md5")
      .update(randomImageBuff)
      .digest("hex");

    const form = formAutoContent({
      image: randomImageBuff,
    });

    const response = await fastify.inject({
      method: "POST",
      url: "/upload-attachment",
      headers: {
        cookie: authHeader,
        ...form.headers,
      },
      payload: form.payload,
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.attachment).toBeDefined();

    const storageUrl = `https://storage.googleapis.com/${fastify.storageBucket.name}`;
    const imageFromStorageBuff = await downloadImageFromUrl(
      `${storageUrl}/${body.attachment}`,
    );

    const imageFromStorageMD5 = crypto
      .createHash("md5")
      .update(imageFromStorageBuff)
      .digest("hex");

    expect(imageFromStorageMD5).toBe(randomImageMD5);
  });

  test("should respond with 403 if file isn't correct type", async () => {
    const authHeader = await authorize("MIKE", fastify);
    const form = formAutoContent({
      image: Buffer.from("test"),
    });

    const response = await fastify.inject({
      method: "POST",
      url: "/upload-attachment",
      headers: {
        cookie: authHeader,
        ...form.headers,
      },
      payload: form.payload,
    });

    expect(response.statusCode).toBe(400);
  });

  test("should respond with 415 if image isn't provided", async () => {
    const authHeader = await authorize("MIKE", fastify);
    const form = formAutoContent({});

    const response = await fastify.inject({
      method: "POST",
      url: "/upload-attachment",
      headers: {
        cookie: authHeader,
        ...form.headers,
      },
      payload: form.payload,
    });

    expect(response.statusCode).toBe(415);
  });
});

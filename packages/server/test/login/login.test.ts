import * as openpgp from "openpgp";
import jwt from "jsonwebtoken";
import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "@jest/globals";
import fastifyCookie from "@fastify/cookie";

import buildForTests from "@test/utils/buildForTests";
import generateKeysForTests from "@test/utils/generateKeysForTests";
import { FAKE_COOKIE_SECRET } from "@test/utils/consts";

import type { Prisma } from "@prisma/client";
import type { TestKeyPair } from "@test/utils/generateKeysForTests";
import type { JwtPayload } from "jsonwebtoken";

describe("REST API - /login", () => {
  const fastify = buildForTests();
  let testUser: Prisma.UserUncheckedCreateInput;
  let pgpTestKey: TestKeyPair;

  beforeAll(async () => {
    pgpTestKey = await generateKeysForTests();
  });

  afterAll(async () => {
    await fastify.close();
  });

  beforeEach(async () => {
    testUser = await fastify.prisma.user.create({
      data: {
        displayName: "John",
        login: "john",
        publicKey: Buffer.from(pgpTestKey.publicKey).toString("base64"),
      },
    });
  });

  afterEach(async () => {
    const res = await fastify.prisma.$runCommandRaw({
      listCollections: 1,
      nameOnly: true,
    });

    // @ts-ignore
    res.cursor?.firstBatch?.forEach(async (collectionJson) => {
      await fastify.prisma.$runCommandRaw({
        drop: collectionJson.name,
      });
    });
  });
  test("should respond cookie with JWT token", async () => {
    const privateKey = await openpgp.decryptKey({
      privateKey: await openpgp.readPrivateKey({
        armoredKey: pgpTestKey.privateKey,
      }),
      passphrase: pgpTestKey.passphrase,
    });

    const response = await fastify.inject({
      method: "POST",
      url: "/login",
      body: {
        signedAlias: await openpgp.sign({
          message: await openpgp.createCleartextMessage({ text: "john" }),
          signingKeys: privateKey,
        }),
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

  test("should respond with 403 without session when signedAlias is signed alias of user who doesn't exists", async () => {
    const privateKey = await openpgp.decryptKey({
      privateKey: await openpgp.readPrivateKey({
        armoredKey: pgpTestKey.privateKey,
      }),
      passphrase: pgpTestKey.passphrase,
    });

    const response = await fastify.inject({
      method: "POST",
      url: "/login",
      body: {
        signedAlias: await openpgp.sign({
          message: await openpgp.createCleartextMessage({ text: "abcd" }),
          signingKeys: privateKey,
        }),
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
    expect(response.statusCode).toBe(403);
  });

  test("should respond with 400 without session when signedAlias is not signed PGP message", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/login",
      body: {
        signedAlias: "abcd",
      },
    });

    expect(await fastify.prisma.session.count()).toBe(0);

    const cookie = response.cookies.find(({ name }) => name === "session");

    expect(cookie).toBeUndefined();
    expect(response.statusCode).toBe(400);
  });

  test("should respond with 400 without session when signedAlias is not provided", async () => {
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
    const privateKey = await openpgp.decryptKey({
      privateKey: await openpgp.readPrivateKey({
        armoredKey: pgpTestKey.privateKey,
      }),
      passphrase: pgpTestKey.passphrase,
    });

    const response = await fastify.inject({
      method: "GET",
      url: "/login",
      body: {
        signedAlias: await openpgp.sign({
          message: await openpgp.createCleartextMessage({ text: "john" }),
          signingKeys: privateKey,
        }),
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

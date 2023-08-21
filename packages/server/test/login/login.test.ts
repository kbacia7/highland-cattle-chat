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

import { FAKE_COOKIE_SECRET } from "@test/utils/consts";

import buildForTests from "@test/utils/buildForTests";

import generateKeysForTests from "@test/utils/generateKeysForTests";

import type { TestKeyPair } from "@test/utils/generateKeysForTests";

import type { DocumentData, DocumentReference } from "@google-cloud/firestore";
import type { JwtPayload } from "jsonwebtoken";

describe("REST API - /login", () => {
  const fastify = buildForTests();
  let pgpTestKey: TestKeyPair;
  let testUserRef: DocumentReference<DocumentData>;

  beforeAll(async () => {
    pgpTestKey = await generateKeysForTests();
  });

  afterAll(async () => {
    await fastify.close();
  });

  beforeEach(async () => {
    testUserRef = await fastify.firestore.collection("users").add({
      displayName: "John",
      publicKey: {
        alias: "john",
        value: Buffer.from(pgpTestKey.publicKey).toString("base64"),
      },
    });
  });

  afterEach(async () => {
    const promises: Promise<FirebaseFirestore.WriteResult>[] = [];
    const collections = await fastify.firestore.listCollections();
    for (let i = 0; i < collections.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const docs = await collections[i].listDocuments();
      for (let j = 0; j < docs.length; j += 1) promises.push(docs[j].delete());
    }

    await Promise.all(promises);
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

    const session = await fastify.firestore
      .collection("sessions")
      .where("user", "==", testUserRef)
      .where("expiresAt", ">", new Date().valueOf())
      .get();

    expect(session.empty).toBe(false);

    const cookie = response.cookies.find(({ name }) => name === "session");
    expect(cookie?.value).toBeTruthy();

    const cookieValue = JSON.parse(
      fastifyCookie.unsign(cookie?.value ?? "", FAKE_COOKIE_SECRET).value ?? "",
    );

    const jwtPayload = jwt.verify(
      cookieValue.token,
      session.docs[0].data().secret,
    ) as JwtPayload;

    expect(cookieValue.userId).toBe(testUserRef.id);
    expect(jwtPayload.userId).toBe(testUserRef.id);
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

    const session = await fastify.firestore
      .collection("sessions")
      .where("user", "==", testUserRef)
      .where("expiresAt", ">", new Date().valueOf())
      .get();

    expect(session.empty).toBe(true);

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

    const sessions = await fastify.firestore
      .collection("sessions")
      .listDocuments();

    expect(sessions.length).toBe(0);

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

    const sessions = await fastify.firestore
      .collection("sessions")
      .listDocuments();

    expect(sessions.length).toBe(0);

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

    const session = await fastify.firestore
      .collection("sessions")
      .where("user", "==", testUserRef)
      .where("expiresAt", ">", new Date().valueOf())
      .get();

    expect(session.empty).toBe(true);

    const cookie = response.cookies.find(({ name }) => name === "session");

    expect(cookie).toBeUndefined();
    expect(response.statusCode).toBe(404);
  });
});

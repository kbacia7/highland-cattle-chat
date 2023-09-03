import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { v4 as uuidv4 } from "uuid";

import {
  FieldValue,
  type DocumentData,
  type DocumentReference,
} from "@google-cloud/firestore";

import authorize from "@test/utils/authorize";
import buildForTests from "@test/utils/buildForTests";

import generateKeysForTests from "@test/utils/generateKeysForTests";

import generateString from "@test/utils/randomString";

import type { TestKeyPair } from "@test/utils/generateKeysForTests";

describe("REST API - /load-conversation", () => {
  const fastify = buildForTests();
  let pgpTestKey: TestKeyPair;
  let testUserRef: DocumentReference<DocumentData>;
  let secondTestUserRef: DocumentReference<DocumentData>;
  let testConversationRef: DocumentReference<DocumentData>;

  beforeAll(async () => {
    pgpTestKey = await generateKeysForTests();
    buildForTests();
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

    secondTestUserRef = await fastify.firestore.collection("users").add({
      displayName: "Mike",
      publicKey: {
        alias: "mike",
        value: Buffer.from(pgpTestKey.publicKey).toString("base64"),
      },
    });

    await fastify.firestore.collection("users").add({
      displayName: "Zapp",
      publicKey: {
        alias: "zapp",
        value: Buffer.from(pgpTestKey.publicKey).toString("base64"),
      },
    });

    testConversationRef = await fastify.firestore
      .collection("conversations")
      .add({
        users: [testUserRef, secondTestUserRef],
        title: uuidv4(),
        image: "https://picsum.photos/200",
      });

    for (let i = 0; i < 100; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await fastify.firestore.collection("messages").add({
        user: Math.random() > 0.5 ? testUserRef : secondTestUserRef,
        conversation: testConversationRef,
        content: generateString(Math.ceil(Math.random() * 9)),
        created: FieldValue.serverTimestamp(),
      });
    }
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

  test("should respond with status 200 and last 100 messages", async () => {
    const authHeader = await authorize(
      pgpTestKey.privateKey,
      pgpTestKey.passphrase,
      "john",
      fastify,
    );

    const response = await fastify.inject({
      method: "GET",
      url: "/load-conversation",
      headers: {
        cookie: authHeader,
      },
      query: {
        id: testConversationRef.id,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    const messages = await fastify.firestore
      .collection("messages")
      .where("conversation", "==", testConversationRef.id)
      .orderBy("created")
      .limit(100)
      .get();

    messages.docs.forEach(async (message) => {
      const data = message.data();
      expect(body).toContainEqual({
        id: message.id,
        user: data?.user,
        conversation: testConversationRef.id,
        content: data?.content,
        created: data?.created,
      });
    });
  });

  test("should respond with status 200 and last 10 messages", async () => {
    const authHeader = await authorize(
      pgpTestKey.privateKey,
      pgpTestKey.passphrase,
      "john",
      fastify,
    );

    const response = await fastify.inject({
      method: "GET",
      url: "/load-conversation",
      headers: {
        cookie: authHeader,
      },
      query: {
        id: testConversationRef.id,
        limit: "10",
      },
    });

    const body = response.json();
    expect(response.statusCode).toBe(200);
    const messages = await fastify.firestore
      .collection("messages")
      .where("conversation", "==", testConversationRef.id)
      .orderBy("created")
      .limit(10)
      .get();

    messages.docs.forEach(async (message) => {
      const data = message.data();
      expect(body).toContainEqual({
        id: message.id,
        user: data?.user,
        conversation: testConversationRef.id,
        content: data?.content,
        created: data?.created,
      });
    });
  });

  test("should respond with status 403 when user isn't participate in conversation", async () => {
    const authHeader = await authorize(
      pgpTestKey.privateKey,
      pgpTestKey.passphrase,
      "zapp",
      fastify,
    );

    const response = await fastify.inject({
      method: "GET",
      url: "/load-conversation",
      headers: {
        cookie: authHeader,
      },
      query: {
        id: testConversationRef.id,
      },
    });

    expect(response.statusCode).toBe(403);
  });

  test("should respond with status 403 when auth cookie is missing", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: "/load-conversation",
      query: {
        id: testConversationRef.id,
      },
    });

    expect(response.statusCode).toBe(403);
  });

  test("should respond with status 403 when auth cookie contains random string", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: "/load-conversation",
      headers: {
        cookie: `session=abcd`,
      },
      query: {
        id: testConversationRef.id,
      },
    });

    expect(response.statusCode).toBe(403);
  });

  test("should respond with status 400 when id query string is missing", async () => {
    const authHeader = await authorize(
      pgpTestKey.privateKey,
      pgpTestKey.passphrase,
      "john",
      fastify,
    );

    const response = await fastify.inject({
      method: "GET",
      url: "/load-conversation",
      headers: {
        cookie: authHeader,
      },
    });

    expect(response.statusCode).toBe(400);
  });
});

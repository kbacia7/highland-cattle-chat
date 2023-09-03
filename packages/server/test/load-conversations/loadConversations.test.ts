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

import authorize from "@test/utils/authorize";
import buildForTests from "@test/utils/buildForTests";

import generateKeysForTests from "@test/utils/generateKeysForTests";

import type { DocumentData, DocumentReference } from "@google-cloud/firestore";
import type { TestKeyPair } from "@test/utils/generateKeysForTests";

describe("REST API - /load-conversations", () => {
  const fastify = buildForTests();
  let pgpTestKey: TestKeyPair;
  let testUserRef: DocumentReference<DocumentData>;
  let secondTestUserRef: DocumentReference<DocumentData>;
  const testConversationRefs: DocumentReference<DocumentData>[] = [];

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

    for (let i = 0; i < 3; i += 1) {
      testConversationRefs.push(
        // eslint-disable-next-line no-await-in-loop
        await fastify.firestore.collection("conversations").add({
          users: [testUserRef, secondTestUserRef],
          title: uuidv4(),
          image: "https://picsum.photos/200",
        }),
      );
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

  test("should respond with status 200 and user conversations", async () => {
    const authHeader = await authorize(
      pgpTestKey.privateKey,
      pgpTestKey.passphrase,
      "john",
      fastify,
    );

    const response = await fastify.inject({
      method: "GET",
      url: "/load-conversations",
      headers: {
        cookie: authHeader,
      },
    });

    const body = response.json();
    expect(response.statusCode).toBe(200);
    testConversationRefs.forEach(async (ref) => {
      const data = (await ref.get())?.data();
      expect(body).toContainEqual({
        id: ref.id,
        image: data?.image,
        title: data?.title,
      });
    });
  });

  test("should respond with status 403 when auth cookie is missing", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: "/load-conversations",
    });

    expect(response.statusCode).toBe(403);
  });

  test("should respond with status 403 when auth cookie contains random string", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: "/load-conversations",
      headers: {
        cookie: `session=abcd`,
      },
    });

    expect(response.statusCode).toBe(403);
  });
});

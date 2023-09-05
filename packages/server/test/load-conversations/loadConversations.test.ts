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

import type { Prisma } from "@prisma/client";
import type { TestKeyPair } from "@test/utils/generateKeysForTests";

describe("REST API - /load-conversations", () => {
  const fastify = buildForTests();
  let pgpTestKey: TestKeyPair;
  let testUser: Prisma.UserUncheckedCreateInput;
  let secondTestUser: Prisma.UserUncheckedCreateInput;
  const testConversations: Prisma.ConversationUncheckedCreateInput[] = [];

  beforeAll(async () => {
    pgpTestKey = await generateKeysForTests();
    buildForTests();
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

    secondTestUser = await fastify.prisma.user.create({
      data: {
        displayName: "Mike",
        login: "mike",
        publicKey: Buffer.from(pgpTestKey.publicKey).toString("base64"),
      },
    });

    for (let i = 0; i < 3; i += 1) {
      testConversations.push(
        // eslint-disable-next-line no-await-in-loop
        await fastify.prisma.conversation.create({
          data: {
            title: uuidv4(),
            image: "https://picsum.photos/200",
            participants: {
              create: [
                {
                  userId: testUser.id ?? "",
                },
                {
                  userId: secondTestUser.id ?? "",
                },
              ],
            },
          },
        }),
      );
    }
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
    testConversations.forEach(async (conversation) => {
      expect(body).toContainEqual({
        id: conversation.id,
        image: conversation.image,
        title: conversation.title,
        createdAt:
          conversation.createdAt instanceof Date
            ? conversation.createdAt.toISOString()
            : conversation.createdAt,
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

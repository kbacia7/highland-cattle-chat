import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";

import WebSocket from "ws";

import { SERVER_PUBLIC_KEY } from "@highland-cattle-chat/shared";

import buildForTests from "@test/utils/buildForTests";

import generateKeysForTests from "@test/utils/generateKeysForTests";
import { FASTIFY_SERVER_PORT_BASE } from "@test/utils/consts";

import type { FastifyInstance } from "fastify";
import type {
  OutcomeMessage,
  IncomeMessage,
} from "@highland-cattle-chat/shared";
import type { TestKeyPair } from "@test/utils/generateKeysForTests";

describe("Websocket real-time route - Message type UNKNOWN_ERROR", () => {
  const fastify: FastifyInstance = buildForTests();
  const SERVER_PORT = FASTIFY_SERVER_PORT_BASE + 2;
  let pgpTestKey: TestKeyPair;
  let secondPgpTestKey: TestKeyPair;

  beforeAll(async () => {
    pgpTestKey = await generateKeysForTests();
    secondPgpTestKey = await generateKeysForTests();
    await fastify.listen({ port: SERVER_PORT });
  });

  afterAll(async () => {
    fastify.close();
  });

  test("should respond with message type UNKNOWN_ERROR on init message when senderPublicKey is not valid PGP key", (done) => {
    const ws = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
    const client = WebSocket.createWebSocketStream(ws);
    const initMessage: IncomeMessage = {
      type: "INIT",
      senderPublicKey: "not-key",
    };

    client.write(JSON.stringify(initMessage));
    client.on("data", (chunk: Buffer) => {
      const res = JSON.parse(chunk.toString());
      expect(res).toStrictEqual({
        senderPublicKey: SERVER_PUBLIC_KEY,
        type: "UNKNOWN_ERROR",
        status: "ERROR",
      });

      ws.close();
      done();
    });
  });

  test("should respond with message type UNKNOWN_ERROR on message when senderPublicKey is not provided", (done) => {
    const ws = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
    const client = WebSocket.createWebSocketStream(ws);
    const initMessage = {
      type: "INIT",
    };

    client.write(JSON.stringify(initMessage));
    client.on("data", (chunk: Buffer) => {
      const res = JSON.parse(chunk.toString());
      expect(res).toStrictEqual({
        senderPublicKey: SERVER_PUBLIC_KEY,
        type: "UNKNOWN_ERROR",
        status: "ERROR",
      });

      ws.close();
      done();
    });
  });

  test("should respond with message type UNKNOWN_ERROR on unknown message type", (done) => {
    const ws = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
    const client = WebSocket.createWebSocketStream(ws);
    const message = {
      type: "anything",
      senderPublicKey: pgpTestKey.publicKey,
    };

    client.write(JSON.stringify(message));
    client.on("data", (chunk: Buffer) => {
      const res = JSON.parse(chunk.toString());
      expect(res).toStrictEqual({
        senderPublicKey: SERVER_PUBLIC_KEY,
        type: "UNKNOWN_ERROR",
        status: "ERROR",
      });

      ws.close();
      done();
    });
  });

  test("should respond with message type UNKNOWN_ERROR if content is non-string", (done) => {
    const ws = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
    const client = WebSocket.createWebSocketStream(ws);
    client.write(
      JSON.stringify({
        type: "INIT",
        senderPublicKey: pgpTestKey.publicKey,
      }),
    );

    const results: OutcomeMessage[] = [];
    const EXCEPTED_ERRORS = 2;
    const onEnd = () => {
      if (results.length === EXCEPTED_ERRORS) {
        expect(results).toStrictEqual(
          Array.from(Array(EXCEPTED_ERRORS)).map(() => ({
            type: "UNKNOWN_ERROR",
            senderPublicKey: SERVER_PUBLIC_KEY,
            status: "ERROR",
          })),
        );

        done();
      }
    };
    client.on("data", (chunk: Buffer) => {
      const res = JSON.parse(chunk.toString()) as OutcomeMessage;
      if (res.type === "INIT") {
        expect(res).toStrictEqual({
          senderPublicKey: SERVER_PUBLIC_KEY,
          type: "INIT",
          recipientPublicKey: pgpTestKey.publicKey,
          status: "OK",
        });

        // NOTE: If you are curious why there is not test with boolean values and numbers
        // see: https://ajv.js.org/coercion.html
        client.write(
          JSON.stringify({
            type: "TEXT",
            senderPublicKey: pgpTestKey.publicKey,
            recipientPublicKey: secondPgpTestKey.publicKey,
            content: [],
          }),
        );

        client.write(
          JSON.stringify({
            type: "TEXT",
            senderPublicKey: pgpTestKey.publicKey,
            recipientPublicKey: secondPgpTestKey.publicKey,
            content: {},
          }),
        );
      } else {
        results.push(res);
        onEnd();
      }
    });
  });
});

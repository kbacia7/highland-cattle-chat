import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import WebSocket from "ws";

import { SERVER_PUBLIC_KEY } from "@highland-cattle-chat/shared";

import buildForTests from "@test/utils/buildForTests";

import generateKeysForTests from "@test/utils/generateKeysForTests";
import { FASTIFY_SERVER_PORT_BASE } from "@test/utils/consts";

import type { FastifyInstance } from "fastify";
import type { IncomeMessage } from "@highland-cattle-chat/shared";
import type { TestKeyPair } from "@test/utils/generateKeysForTests";

describe("Websocket real-time route - Message type INIT", () => {
  const fastify: FastifyInstance = buildForTests();
  const SERVER_PORT = FASTIFY_SERVER_PORT_BASE + 1;
  let pgpTestKey: TestKeyPair;

  beforeAll(async () => {
    pgpTestKey = await generateKeysForTests();
    await fastify.listen({ port: SERVER_PORT });
  });

  afterAll(async () => {
    fastify.close();
  });

  test("should respond on init message type", (done) => {
    const ws = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
    const client = WebSocket.createWebSocketStream(ws);
    const initMessage: IncomeMessage = {
      type: "INIT",
      senderPublicKey: pgpTestKey.publicKey,
    };

    client.write(JSON.stringify(initMessage));
    client.on("data", (chunk: Buffer) => {
      const res = JSON.parse(chunk.toString());
      expect(res).toStrictEqual({
        senderPublicKey: SERVER_PUBLIC_KEY,
        type: "INIT",
        recipientPublicKey: pgpTestKey.publicKey,
        status: "OK",
      });

      ws.close();
      done();
    });
  });

  test("should respond with status ERROR on init message when connection to user with senderPublicKey is yet opened (one WS connection)", (done) => {
    const ws = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
    const client = WebSocket.createWebSocketStream(ws);
    let secondCall = false;
    const initMessage: IncomeMessage = {
      type: "INIT",
      senderPublicKey: pgpTestKey.publicKey,
    };

    client.write(JSON.stringify(initMessage));
    client.on("data", (chunk: Buffer) => {
      const res = JSON.parse(chunk.toString());
      if (secondCall) {
        expect(res).toStrictEqual({
          senderPublicKey: SERVER_PUBLIC_KEY,
          type: "INIT",
          recipientPublicKey: pgpTestKey.publicKey,
          status: "ERROR",
        });

        ws.close();
        done();
      } else {
        expect(res).toStrictEqual({
          senderPublicKey: SERVER_PUBLIC_KEY,
          type: "INIT",
          recipientPublicKey: pgpTestKey.publicKey,
          status: "OK",
        });

        client.write(JSON.stringify(initMessage));
        secondCall = true;
      }
    });
  });

  test("should respond with status ERROR on init message when connection to user with senderPublicKey is yet opened (two WS connections, one after each other)", (done) => {
    const firstWs = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
    const secondWs = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
    const firstClient = WebSocket.createWebSocketStream(firstWs);
    const secondClient = WebSocket.createWebSocketStream(secondWs);
    const initMessage: IncomeMessage = {
      type: "INIT",
      senderPublicKey: pgpTestKey.publicKey,
    };

    firstClient.write(JSON.stringify(initMessage));
    firstClient.on("data", (chunk: Buffer) => {
      const res = JSON.parse(chunk.toString());
      expect(res).toStrictEqual({
        senderPublicKey: SERVER_PUBLIC_KEY,
        type: "INIT",
        recipientPublicKey: pgpTestKey.publicKey,
        status: "OK",
      });

      secondClient.write(JSON.stringify(initMessage));
    });

    secondClient.on("data", (chunk: Buffer) => {
      const res = JSON.parse(chunk.toString());
      expect(res).toStrictEqual({
        senderPublicKey: SERVER_PUBLIC_KEY,
        type: "INIT",
        recipientPublicKey: pgpTestKey.publicKey,
        status: "ERROR",
      });

      firstWs.close();
      secondWs.close();
      done();
    });
  });

  test("should respond with status ERROR on init message when connection to user with senderPublicKey is yet opened (two WS connections, parallel)", (done) => {
    const firstWs = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
    const secondWs = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
    const firstClient = WebSocket.createWebSocketStream(firstWs);
    const secondClient = WebSocket.createWebSocketStream(secondWs);
    const initMessage: IncomeMessage = {
      type: "INIT",
      senderPublicKey: pgpTestKey.publicKey,
    };

    const results: IncomeMessage[] = [];
    const onEnd = () => {
      if (results.length === 2) {
        expect(results).toContainEqual({
          senderPublicKey: SERVER_PUBLIC_KEY,
          type: "INIT",
          recipientPublicKey: pgpTestKey.publicKey,
          status: "OK",
        });

        expect(results).toContainEqual({
          senderPublicKey: SERVER_PUBLIC_KEY,
          type: "INIT",
          recipientPublicKey: pgpTestKey.publicKey,
          status: "ERROR",
        });

        firstWs.close();
        secondWs.close();
        done();
      }
    };

    const onData = (chunk: Buffer) => {
      results.push(JSON.parse(chunk.toString()));
      onEnd();
    };

    firstClient.write(JSON.stringify(initMessage));
    secondClient.write(JSON.stringify(initMessage));
    firstClient.on("data", onData);
    secondClient.on("data", onData);
  });
});

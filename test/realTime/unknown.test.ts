import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import Fastify, { type FastifyInstance } from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import WebSocket from "ws";

import { SERVER_PUBLIC_KEY } from "@routes/realTime/consts";
import realTimeRoute from "@routes/realTime";

import type { IncomeMessage, OutcomeMessage } from "@/types/messages";
import {
  FASTIFY_SERVER_PORT_BASE,
  SECOND_PUBLIC_KEY,
  TEST_PUBLIC_KEY,
} from "./consts";

describe("Websocket real-time route - Message type UNKNOWN_ERROR", () => {
  const fastify: FastifyInstance = Fastify();
  const SERVER_PORT = FASTIFY_SERVER_PORT_BASE + 2;
  beforeAll(async () => {
    fastify.register(fastifyWebsocket);
    fastify.register(realTimeRoute);
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
      senderPublicKey: TEST_PUBLIC_KEY,
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
        senderPublicKey: TEST_PUBLIC_KEY,
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
          recipientPublicKey: TEST_PUBLIC_KEY,
          status: "OK",
        });

        // NOTE: If you are curious why there is not test with boolean values and numbers
        // see: https://ajv.js.org/coercion.html
        client.write(
          JSON.stringify({
            type: "TEXT",
            senderPublicKey: TEST_PUBLIC_KEY,
            recipientPublicKey: SECOND_PUBLIC_KEY,
            content: [],
          }),
        );

        client.write(
          JSON.stringify({
            type: "TEXT",
            senderPublicKey: TEST_PUBLIC_KEY,
            recipientPublicKey: SECOND_PUBLIC_KEY,
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

import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { nanoid } from "nanoid";
import WebSocket from "ws";

import { SERVER_USER_ID } from "@highland-cattle-chat/shared";

import build from "@/app";

import { FASTIFY_SERVER_PORT_BASE } from "@test/utils/consts";

import type { FastifyInstance } from "fastify";
import type {
  OutcomeMessage,
  IncomeMessage,
} from "@highland-cattle-chat/shared";

describe("Websocket real-time route - Message type UNKNOWN_ERROR", () => {
  let fastify: FastifyInstance;
  const SERVER_PORT = FASTIFY_SERVER_PORT_BASE + 2;

  beforeEach(async () => {
    fastify = await build();
    await fastify.listen({ port: SERVER_PORT });
  });

  afterEach(async () => {
    await fastify.close();
  });

  test("should respond with message type UNKNOWN_ERROR on init message when userId is not provided", () =>
    new Promise<void>((done) => {
      const ws = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
      const client = WebSocket.createWebSocketStream(ws);
      // @ts-ignore
      const initMessage: IncomeMessage = {
        type: "INIT",
      };

      client.write(JSON.stringify(initMessage));
      client.on("data", (chunk: Buffer) => {
        const res = JSON.parse(chunk.toString());
        expect(res).toStrictEqual({
          userId: SERVER_USER_ID,
          type: "UNKNOWN_ERROR",
          status: "ERROR",
        } as OutcomeMessage);

        ws.close();
        done();
      });
    }));

  test("should respond with message type UNKNOWN_ERROR on unknown message type", () =>
    new Promise<void>((done) => {
      const ws = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
      const client = WebSocket.createWebSocketStream(ws);
      const message: IncomeMessage = {
        // @ts-ignore
        type: "anything",
        userId: nanoid(),
      };

      client.write(JSON.stringify(message));
      client.on("data", (chunk: Buffer) => {
        const res = JSON.parse(chunk.toString());
        expect(res).toStrictEqual({
          userId: SERVER_USER_ID,
          type: "UNKNOWN_ERROR",
          status: "ERROR",
        } as OutcomeMessage);

        ws.close();
        done();
      });
    }));

  test("should respond with message type UNKNOWN_ERROR if content is non-string", () =>
    new Promise<void>((done) => {
      const ws = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
      const client = WebSocket.createWebSocketStream(ws);
      client.write(
        JSON.stringify({
          type: "INIT",
          userId: nanoid(),
        } as IncomeMessage),
      );

      const results: OutcomeMessage[] = [];
      const EXCEPTED_ERRORS = 2;
      const onEnd = () => {
        if (results.length === EXCEPTED_ERRORS) {
          expect(results).toStrictEqual(
            Array.from(Array(EXCEPTED_ERRORS)).map(
              () =>
                ({
                  type: "UNKNOWN_ERROR",
                  userId: SERVER_USER_ID,
                  status: "ERROR",
                } as OutcomeMessage),
            ),
          );

          done();
        }
      };

      client.on("data", (chunk: Buffer) => {
        const res = JSON.parse(chunk.toString()) as OutcomeMessage;
        if (res.type === "INIT") {
          expect(res).toStrictEqual({
            userId: SERVER_USER_ID,
            type: "INIT",
            status: "OK",
          } as OutcomeMessage);

          // NOTE: If you are curious why there is not test with boolean values and numbers
          // see: https://ajv.js.org/coercion.html
          client.write(
            // @ts-ignore
            JSON.stringify({
              type: "TEXT",
              userId: nanoid(),
              content: [],
            } as IncomeMessage),
          );

          client.write(
            // @ts-ignore
            JSON.stringify({
              type: "TEXT",
              userId: nanoid(),
              content: {},
            } as IncomeMessage),
          );
        } else {
          results.push(res);
          onEnd();
        }
      });
    }));
});

import { afterEach, beforeEach, describe, expect, test } from "vitest";
import WebSocket from "ws";
import { v4 as uuidv4 } from "uuid";

import { SERVER_USER_ID } from "@highland-cattle-chat/shared";

import build from "@/app";

import { FASTIFY_SERVER_PORT_BASE } from "@test/utils/consts";

import type { FastifyInstance } from "fastify";
import type {
  IncomeMessage,
  OutcomeMessage,
} from "@highland-cattle-chat/shared";

describe("Websocket real-time route - Message type INIT", () => {
  let fastify: FastifyInstance;
  const SERVER_PORT = FASTIFY_SERVER_PORT_BASE + 1;

  beforeEach(async () => {
    fastify = await build();
    await fastify.listen({ port: SERVER_PORT });
  });

  afterEach(async () => {
    await fastify.close();
  });

  test("should respond on init message type", () =>
    new Promise<void>((done) => {
      const ws = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
      const client = WebSocket.createWebSocketStream(ws);
      const userId = uuidv4();
      const initMessage: IncomeMessage = {
        type: "INIT",
        userId,
      };

      client.write(JSON.stringify(initMessage));
      client.on("data", (chunk: Buffer) => {
        const res = JSON.parse(chunk.toString());
        expect(res).toStrictEqual({
          userId: SERVER_USER_ID,
          type: "INIT",
          status: "OK",
        } as OutcomeMessage);

        ws.close();
        done();
      });
    }));

  test("should respond with status ERROR on init message when connection to user with userId is yet opened (one WS connection)", () =>
    new Promise<void>((done) => {
      const ws = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
      const client = WebSocket.createWebSocketStream(ws);
      let secondCall = false;
      const userId = uuidv4();
      const initMessage: IncomeMessage = {
        type: "INIT",
        userId,
      };

      client.write(JSON.stringify(initMessage));
      client.on("data", (chunk: Buffer) => {
        const res = JSON.parse(chunk.toString());
        if (secondCall) {
          expect(res).toStrictEqual({
            userId: SERVER_USER_ID,
            type: "INIT",
            status: "ERROR",
          } as OutcomeMessage);

          ws.close();
          done();
        } else {
          expect(res).toStrictEqual({
            userId: SERVER_USER_ID,
            type: "INIT",
            status: "OK",
          } as OutcomeMessage);

          client.write(JSON.stringify(initMessage));
          secondCall = true;
        }
      });
    }));

  test("should respond with status ERROR on init message when connection to user with userId is yet opened (two WS connections, one after each other)", () =>
    new Promise<void>((done) => {
      const firstWs = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
      const secondWs = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
      const firstClient = WebSocket.createWebSocketStream(firstWs);
      const secondClient = WebSocket.createWebSocketStream(secondWs);
      const userId = uuidv4();
      const initMessage: IncomeMessage = {
        type: "INIT",
        userId,
      };

      firstClient.write(JSON.stringify(initMessage));
      firstClient.on("data", (chunk: Buffer) => {
        const res = JSON.parse(chunk.toString());
        expect(res).toStrictEqual({
          userId: SERVER_USER_ID,
          type: "INIT",
          status: "OK",
        } as OutcomeMessage);

        secondClient.write(JSON.stringify(initMessage));
      });

      secondClient.on("data", (chunk: Buffer) => {
        const res = JSON.parse(chunk.toString());
        expect(res).toStrictEqual({
          userId: SERVER_USER_ID,
          type: "INIT",
          status: "ERROR",
        } as OutcomeMessage);

        firstWs.close();
        secondWs.close();
        done();
      });
    }));

  test("should respond with status ERROR on init message when connection to user with userId is yet opened (two WS connections, parallel)", () =>
    new Promise<void>((done) => {
      const firstWs = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
      const secondWs = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
      const firstClient = WebSocket.createWebSocketStream(firstWs);
      const secondClient = WebSocket.createWebSocketStream(secondWs);
      const userId = uuidv4();
      const initMessage: IncomeMessage = {
        type: "INIT",
        userId,
      };

      const results: IncomeMessage[] = [];
      const onEnd = () => {
        if (results.length === 2) {
          expect(results).toContainEqual({
            userId: SERVER_USER_ID,
            type: "INIT",
            status: "OK",
          } as OutcomeMessage);

          expect(results).toContainEqual({
            userId: SERVER_USER_ID,
            type: "INIT",
            status: "ERROR",
          } as OutcomeMessage);

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
    }));
});

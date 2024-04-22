import { afterEach, beforeEach, describe, expect, test } from "vitest";
import WebSocket from "ws";

import build from "@/app";

import { FASTIFY_SERVER_PORT_BASE } from "@test/utils/consts";
import authorize from "@test/utils/authorize";

import type { FastifyInstance } from "fastify";
import type {
  IncomeMessage,
  OutcomeMessage,
} from "@highland-cattle-chat/shared";

describe("Websocket real-time route - Message type INIT", () => {
  let fastify: FastifyInstance;
  const SERVER_PORT = FASTIFY_SERVER_PORT_BASE + 1;

  let authHeader: string;
  beforeEach(async () => {
    fastify = await build();
    await fastify.listen({ port: SERVER_PORT });

    authHeader = await authorize("john@example.com", "password-john", fastify);
  });

  afterEach(async () => {
    await fastify.close();
  });

  test("should respond on init message type", () =>
    new Promise<void>((done) => {
      const ws = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`, {
        headers: {
          cookie: authHeader,
        },
      });
      const client = WebSocket.createWebSocketStream(ws);
      const initMessage: IncomeMessage = {
        type: "INIT",
      };

      client.write(JSON.stringify(initMessage));
      client.on("data", (chunk: Buffer) => {
        const res = JSON.parse(chunk.toString());
        expect(res).toStrictEqual({
          type: "INIT",
          status: "OK",
        } as OutcomeMessage);

        ws.close();
        done();
      });
    }));

  test("should respond with status ERROR on init message when connection to user with userId is yet opened (one WS connection)", () =>
    new Promise<void>((done) => {
      const ws = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`, {
        headers: {
          cookie: authHeader,
        },
      });

      const client = WebSocket.createWebSocketStream(ws);
      let secondCall = false;
      const initMessage: IncomeMessage = {
        type: "INIT",
      };

      client.write(JSON.stringify(initMessage));
      client.on("data", (chunk: Buffer) => {
        const res = JSON.parse(chunk.toString());
        if (secondCall) {
          expect(res).toStrictEqual({
            type: "INIT",
            status: "ERROR",
          } as OutcomeMessage);

          ws.close();
          done();
        } else {
          expect(res).toStrictEqual({
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
      const firstWs = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`, {
        headers: {
          cookie: authHeader,
        },
      });
      const secondWs = new WebSocket(
        `ws://localhost:${SERVER_PORT}/real-time`,
        {
          headers: {
            cookie: authHeader,
          },
        },
      );
      const firstClient = WebSocket.createWebSocketStream(firstWs);
      const secondClient = WebSocket.createWebSocketStream(secondWs);
      const initMessage: IncomeMessage = {
        type: "INIT",
      };

      firstClient.write(JSON.stringify(initMessage));
      firstClient.on("data", (chunk: Buffer) => {
        const res = JSON.parse(chunk.toString());
        expect(res).toStrictEqual({
          type: "INIT",
          status: "OK",
        } as OutcomeMessage);

        secondClient.write(JSON.stringify(initMessage));
      });

      secondClient.on("data", (chunk: Buffer) => {
        const res = JSON.parse(chunk.toString());
        expect(res).toStrictEqual({
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
      const firstWs = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`, {
        headers: {
          cookie: authHeader,
        },
      });
      const secondWs = new WebSocket(
        `ws://localhost:${SERVER_PORT}/real-time`,
        {
          headers: {
            cookie: authHeader,
          },
        },
      );
      const firstClient = WebSocket.createWebSocketStream(firstWs);
      const secondClient = WebSocket.createWebSocketStream(secondWs);
      const initMessage: IncomeMessage = {
        type: "INIT",
      };

      const results: IncomeMessage[] = [];
      const onEnd = () => {
        if (results.length === 2) {
          expect(results).toContainEqual({
            type: "INIT",
            status: "OK",
          } as OutcomeMessage);

          expect(results).toContainEqual({
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

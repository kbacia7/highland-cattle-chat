import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import Fastify, { type FastifyInstance } from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import WebSocket from "ws";

import { SERVER_PUBLIC_KEY } from "@highland-cattle-chat/shared";
import type { OutcomeMessage } from "@highland-cattle-chat/shared";

import realTimeRoute from "../../src/routes/realTime";

import {
  FASTIFY_SERVER_PORT_BASE,
  SECOND_PUBLIC_KEY,
  TEST_PUBLIC_KEY,
} from "./consts";

describe("Websocket real-time route - Message type TEXT", () => {
  const fastify: FastifyInstance = Fastify();
  const SERVER_PORT = FASTIFY_SERVER_PORT_BASE + 3;
  beforeAll(async () => {
    fastify.register(fastifyWebsocket);
    fastify.register(realTimeRoute);
    await fastify.listen({ port: SERVER_PORT });
  });

  afterAll(async () => {
    fastify.close();
  });

  test("should send message to recipient and sender", (done) => {
    const senderWs = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
    const recipientWs = new WebSocket(
      `ws://localhost:${SERVER_PORT}/real-time`,
    );
    const senderClient = WebSocket.createWebSocketStream(senderWs);
    const recipientClient = WebSocket.createWebSocketStream(recipientWs);
    let doneInitializations = 0;
    let receivedText = 0;
    const onInit = () =>
      doneInitializations === 2 &&
      senderClient.write(
        JSON.stringify({
          type: "TEXT",
          senderPublicKey: TEST_PUBLIC_KEY,
          recipientPublicKey: SECOND_PUBLIC_KEY,
          content: "Message",
        }),
      );

    senderClient.write(
      JSON.stringify({
        type: "INIT",
        senderPublicKey: TEST_PUBLIC_KEY,
      }),
    );

    recipientClient.write(
      JSON.stringify({
        type: "INIT",
        senderPublicKey: SECOND_PUBLIC_KEY,
      }),
    );

    const onEnd = () => {
      if (receivedText === 2) {
        senderWs.close();
        recipientWs.close();
        done();
      }
    };

    senderClient.on("data", (chunk: Buffer) => {
      const res = JSON.parse(chunk.toString()) as OutcomeMessage;
      if (res.type === "INIT") {
        doneInitializations += 1;
        expect(res).toStrictEqual({
          senderPublicKey: SERVER_PUBLIC_KEY,
          type: "INIT",
          recipientPublicKey: TEST_PUBLIC_KEY,
          status: "OK",
        });

        onInit();
      } else {
        receivedText += 1;
        expect(res).toStrictEqual({
          senderPublicKey: TEST_PUBLIC_KEY,
          type: "TEXT",
          recipientPublicKey: SECOND_PUBLIC_KEY,
          content: "Message",
          status: "OK",
        });

        onEnd();
      }
    });

    recipientClient.on("data", (chunk: Buffer) => {
      const res = JSON.parse(chunk.toString());
      if (res.type === "INIT") {
        doneInitializations += 1;
        expect(res).toStrictEqual({
          senderPublicKey: SERVER_PUBLIC_KEY,
          type: "INIT",
          recipientPublicKey: SECOND_PUBLIC_KEY,
          status: "OK",
        });

        onInit();
      } else {
        receivedText += 1;
        expect(res).toStrictEqual({
          senderPublicKey: TEST_PUBLIC_KEY,
          type: "TEXT",
          recipientPublicKey: SECOND_PUBLIC_KEY,
          content: "Message",
          status: "OK",
        });

        onEnd();
      }
    });
  });

  test("should send message to sender if recipient disconnect", (done) => {
    const senderWs = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
    const recipientWs = new WebSocket(
      `ws://localhost:${SERVER_PORT}/real-time`,
    );
    const senderClient = WebSocket.createWebSocketStream(senderWs);
    const recipientClient = WebSocket.createWebSocketStream(recipientWs);
    let doneInitializations = 0;
    const onInit = () =>
      doneInitializations === 2 &&
      senderClient.write(
        JSON.stringify({
          type: "TEXT",
          senderPublicKey: TEST_PUBLIC_KEY,
          recipientPublicKey: SECOND_PUBLIC_KEY,
          content: "Message",
        }),
      );

    senderClient.write(
      JSON.stringify({
        type: "INIT",
        senderPublicKey: TEST_PUBLIC_KEY,
      }),
    );

    recipientClient.write(
      JSON.stringify({
        type: "INIT",
        senderPublicKey: SECOND_PUBLIC_KEY,
      }),
    );

    senderClient.on("data", (chunk: Buffer) => {
      const res = JSON.parse(chunk.toString()) as OutcomeMessage;
      if (res.type === "INIT") {
        doneInitializations += 1;
        expect(res).toStrictEqual({
          senderPublicKey: SERVER_PUBLIC_KEY,
          type: "INIT",
          recipientPublicKey: TEST_PUBLIC_KEY,
          status: "OK",
        });

        onInit();
      } else {
        expect(res).toStrictEqual({
          senderPublicKey: TEST_PUBLIC_KEY,
          type: "TEXT",
          recipientPublicKey: SECOND_PUBLIC_KEY,
          content: "Message",
          status: "OK",
        });

        senderWs.close();
        done();
      }
    });

    recipientClient.on("data", (chunk: Buffer) => {
      const res = JSON.parse(chunk.toString());
      if (res.type === "INIT") {
        doneInitializations += 1;
        expect(res).toStrictEqual({
          senderPublicKey: SERVER_PUBLIC_KEY,
          type: "INIT",
          recipientPublicKey: SECOND_PUBLIC_KEY,
          status: "OK",
        });

        onInit();
        recipientWs.close();
      }
    });
  });

  test("should respond message to recipient if sender disconnect", (done) => {
    const senderWs = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
    const recipientWs = new WebSocket(
      `ws://localhost:${SERVER_PORT}/real-time`,
    );
    const senderClient = WebSocket.createWebSocketStream(senderWs);
    const recipientClient = WebSocket.createWebSocketStream(recipientWs);
    let doneInitializations = 0;
    const onInit = () => {
      if (doneInitializations === 2) {
        senderClient.write(
          JSON.stringify({
            type: "TEXT",
            senderPublicKey: TEST_PUBLIC_KEY,
            recipientPublicKey: SECOND_PUBLIC_KEY,
            content: "Message",
          }),
        );

        senderWs.close();
      }
    };

    senderClient.write(
      JSON.stringify({
        type: "INIT",
        senderPublicKey: TEST_PUBLIC_KEY,
      }),
    );

    recipientClient.write(
      JSON.stringify({
        type: "INIT",
        senderPublicKey: SECOND_PUBLIC_KEY,
      }),
    );

    senderClient.on("data", (chunk: Buffer) => {
      const res = JSON.parse(chunk.toString()) as OutcomeMessage;
      if (res.type === "INIT") {
        doneInitializations += 1;
        expect(res).toStrictEqual({
          senderPublicKey: SERVER_PUBLIC_KEY,
          type: "INIT",
          recipientPublicKey: TEST_PUBLIC_KEY,
          status: "OK",
        });

        onInit();
      }
    });

    recipientClient.on("data", (chunk: Buffer) => {
      const res = JSON.parse(chunk.toString());
      if (res.type === "INIT") {
        doneInitializations += 1;
        expect(res).toStrictEqual({
          senderPublicKey: SERVER_PUBLIC_KEY,
          type: "INIT",
          recipientPublicKey: SECOND_PUBLIC_KEY,
          status: "OK",
        });

        onInit();
      } else {
        expect(res).toStrictEqual({
          senderPublicKey: TEST_PUBLIC_KEY,
          type: "TEXT",
          recipientPublicKey: SECOND_PUBLIC_KEY,
          content: "Message",
          status: "OK",
        });

        senderWs.close();
        recipientWs.close();
        done();
      }
    });
  });

  test("should respond message to sender with status ERROR if recipientPublicKey is not provided", (done) => {
    const senderWs = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
    const senderClient = WebSocket.createWebSocketStream(senderWs);
    senderClient.write(
      JSON.stringify({
        type: "INIT",
        senderPublicKey: TEST_PUBLIC_KEY,
      }),
    );

    senderClient.on("data", (chunk: Buffer) => {
      const res = JSON.parse(chunk.toString()) as OutcomeMessage;
      if (res.type === "INIT") {
        expect(res).toStrictEqual({
          senderPublicKey: SERVER_PUBLIC_KEY,
          type: "INIT",
          recipientPublicKey: TEST_PUBLIC_KEY,
          status: "OK",
        });

        senderClient.write(
          JSON.stringify({
            type: "TEXT",
            senderPublicKey: TEST_PUBLIC_KEY,
            content: "Message",
          }),
        );
      } else {
        expect(res).toStrictEqual({
          senderPublicKey: SERVER_PUBLIC_KEY,
          type: "TEXT",
          recipientPublicKey: TEST_PUBLIC_KEY,
          status: "ERROR",
        });

        senderWs.close();
        done();
      }
    });
  });

  test("should respond message to sender with status ERROR if content is not provided", (done) => {
    const senderWs = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
    const senderClient = WebSocket.createWebSocketStream(senderWs);
    senderClient.write(
      JSON.stringify({
        type: "INIT",
        senderPublicKey: TEST_PUBLIC_KEY,
      }),
    );

    senderClient.on("data", (chunk: Buffer) => {
      const res = JSON.parse(chunk.toString()) as OutcomeMessage;
      if (res.type === "INIT") {
        expect(res).toStrictEqual({
          senderPublicKey: SERVER_PUBLIC_KEY,
          type: "INIT",
          recipientPublicKey: TEST_PUBLIC_KEY,
          status: "OK",
        });

        senderClient.write(
          JSON.stringify({
            type: "TEXT",
            senderPublicKey: TEST_PUBLIC_KEY,
            recipientPublicKey: SECOND_PUBLIC_KEY,
          }),
        );
      } else {
        expect(res).toStrictEqual({
          senderPublicKey: SERVER_PUBLIC_KEY,
          type: "TEXT",
          recipientPublicKey: TEST_PUBLIC_KEY,
          status: "ERROR",
        });

        senderWs.close();
        done();
      }
    });
  });
});

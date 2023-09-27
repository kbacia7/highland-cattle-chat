import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import { v4 as uuidv4 } from "uuid";
import WebSocket from "ws";

import { SERVER_USER_ID } from "@highland-cattle-chat/shared";

import buildForTests from "@test/utils/buildForTests";

import { FASTIFY_SERVER_PORT_BASE } from "@test/utils/consts";

import type { FastifyInstance } from "fastify";
import type { OutcomeMessage } from "@highland-cattle-chat/shared";

describe("Websocket real-time route - Message type TEXT", () => {
  const fastify: FastifyInstance = buildForTests();
  const SERVER_PORT = FASTIFY_SERVER_PORT_BASE + 3;
  const senderUserId = uuidv4();
  const secondSenderUserId = uuidv4();

  beforeAll(async () => {
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
          senderUserId,
          recipientUserId: secondSenderUserId,
          content: "Message",
        }),
      );

    senderClient.write(
      JSON.stringify({
        type: "INIT",
        senderUserId,
      }),
    );

    recipientClient.write(
      JSON.stringify({
        type: "INIT",
        senderUserId: secondSenderUserId,
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
          senderUserId: SERVER_USER_ID,
          type: "INIT",
          recipientUserId: senderUserId,
          status: "OK",
        });

        onInit();
      } else {
        receivedText += 1;
        expect(res).toStrictEqual({
          senderUserId,
          type: "TEXT",
          recipientUserId: secondSenderUserId,
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
          senderUserId: SERVER_USER_ID,
          type: "INIT",
          recipientUserId: secondSenderUserId,
          status: "OK",
        });

        onInit();
      } else {
        receivedText += 1;
        expect(res).toStrictEqual({
          senderUserId,
          type: "TEXT",
          recipientUserId: secondSenderUserId,
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
          senderUserId,
          recipientUserId: secondSenderUserId,
          content: "Message",
        }),
      );

    senderClient.write(
      JSON.stringify({
        type: "INIT",
        senderUserId,
      }),
    );

    recipientClient.write(
      JSON.stringify({
        type: "INIT",
        senderUserId: secondSenderUserId,
      }),
    );

    senderClient.on("data", (chunk: Buffer) => {
      const res = JSON.parse(chunk.toString()) as OutcomeMessage;
      if (res.type === "INIT") {
        doneInitializations += 1;
        expect(res).toStrictEqual({
          senderUserId: SERVER_USER_ID,
          recipientUserId: senderUserId,
          type: "INIT",
          status: "OK",
        });

        onInit();
      } else {
        expect(res).toStrictEqual({
          senderUserId,
          type: "TEXT",
          recipientUserId: secondSenderUserId,
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
          senderUserId: SERVER_USER_ID,
          type: "INIT",
          recipientUserId: secondSenderUserId,
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
            senderUserId,
            recipientUserId: secondSenderUserId,
            content: "Message",
          }),
        );

        senderWs.close();
      }
    };

    senderClient.write(
      JSON.stringify({
        type: "INIT",
        senderUserId,
      }),
    );

    recipientClient.write(
      JSON.stringify({
        type: "INIT",
        senderUserId: secondSenderUserId,
      }),
    );

    senderClient.on("data", (chunk: Buffer) => {
      const res = JSON.parse(chunk.toString()) as OutcomeMessage;
      if (res.type === "INIT") {
        doneInitializations += 1;
        expect(res).toStrictEqual({
          senderUserId: SERVER_USER_ID,
          recipientUserId: senderUserId,
          type: "INIT",
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
          senderUserId: SERVER_USER_ID,
          recipientUserId: secondSenderUserId,
          type: "INIT",
          status: "OK",
        });

        onInit();
      } else {
        expect(res).toStrictEqual({
          senderUserId,
          recipientUserId: secondSenderUserId,
          type: "TEXT",
          content: "Message",
          status: "OK",
        });

        senderWs.close();
        recipientWs.close();
        done();
      }
    });
  });

  test("should respond message to sender with status ERROR if recipientUserId is not provided", (done) => {
    const senderWs = new WebSocket(`ws://localhost:${SERVER_PORT}/real-time`);
    const senderClient = WebSocket.createWebSocketStream(senderWs);
    senderClient.write(
      JSON.stringify({
        type: "INIT",
        senderUserId,
      }),
    );

    senderClient.on("data", (chunk: Buffer) => {
      const res = JSON.parse(chunk.toString()) as OutcomeMessage;
      if (res.type === "INIT") {
        expect(res).toStrictEqual({
          senderUserId: SERVER_USER_ID,
          recipientUserId: senderUserId,
          type: "INIT",
          status: "OK",
        });

        senderClient.write(
          JSON.stringify({
            senderUserId,
            type: "TEXT",
            content: "Message",
          }),
        );
      } else {
        expect(res).toStrictEqual({
          senderUserId: SERVER_USER_ID,
          type: "TEXT",
          recipientUserId: senderUserId,
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
        senderUserId,
      }),
    );

    senderClient.on("data", (chunk: Buffer) => {
      const res = JSON.parse(chunk.toString()) as OutcomeMessage;
      if (res.type === "INIT") {
        expect(res).toStrictEqual({
          senderUserId: SERVER_USER_ID,
          recipientUserId: senderUserId,
          type: "INIT",
          status: "OK",
        });

        senderClient.write(
          JSON.stringify({
            type: "TEXT",
            senderUserId,
            recipientUserId: secondSenderUserId,
          }),
        );
      } else {
        expect(res).toStrictEqual({
          senderUserId: SERVER_USER_ID,
          type: "TEXT",
          status: "ERROR",
          recipientUserId: senderUserId,
        });

        senderWs.close();
        done();
      }
    });
  });
});

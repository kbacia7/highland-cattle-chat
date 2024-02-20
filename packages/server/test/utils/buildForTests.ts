import Fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyCookie from "@fastify/cookie";
import fastifyMultipart from "@fastify/multipart";

import realTimeRoute from "@routes/realTime";
import registerUserRoute from "@routes/register";
import loginUserRoute from "@routes/login";

import restrictedContext from "@contexts/restrictedContext";
import { createPrismaClient } from "@/prismaConnector";
import cacheConnector from "@/cacheConnector";
import workersConnector from "@/workersConnector";

import createGuideUser from "@/createGuideUser";

import { FAKE_COOKIE_SECRET } from "./consts";

import type { FastifyInstance } from "fastify";

const buildForTests = () => {
  const fastify: FastifyInstance = Fastify();
  fastify.register(fastifyCookie, {
    secret: FAKE_COOKIE_SECRET,
  });

  fastify.register(fastifyWebsocket);
  fastify.register(fastifyMultipart, {
    attachFieldsToBody: "keyValues",
    limits: {
      fieldNameSize: 100,
      fieldSize: 100,
      fileSize: 5000000,
      files: 1,
      headerPairs: 2000,
      parts: 10,
    },
  });
  fastify.register(cacheConnector);
  fastify.decorate(
    "prisma",
    createPrismaClient(fastify, {
      datasourceUrl: process.env.JEST_TESTS_DATABASE_URL,
    }),
  );
  fastify.register(workersConnector);
  fastify.register(realTimeRoute);
  fastify.register(registerUserRoute);
  fastify.register(loginUserRoute);
  fastify.register(restrictedContext);
  fastify.register(createGuideUser);

  return fastify;
};

export default buildForTests;

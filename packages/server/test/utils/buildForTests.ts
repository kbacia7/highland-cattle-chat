import Fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyCookie from "@fastify/cookie";

import realTimeRoute from "@routes/realTime";
import loginUserRoute from "@routes/login";

import restrictedContext from "@contexts/restrictedContext";
import { createPrismaClient } from "@/prismaConnector";
import cacheConnector from "@/cacheConnector";
import workersConnector from "@/workersConnector";

import { FAKE_COOKIE_SECRET } from "./consts";

import type { FastifyInstance } from "fastify";

const buildForTests = () => {
  const fastify: FastifyInstance = Fastify();
  fastify.register(fastifyCookie, {
    secret: FAKE_COOKIE_SECRET,
  });

  fastify.register(fastifyWebsocket);
  fastify.register(cacheConnector);
  fastify.decorate("prisma", createPrismaClient(fastify));
  fastify.register(workersConnector);
  fastify.register(realTimeRoute);
  fastify.register(loginUserRoute);
  fastify.register(restrictedContext);

  return fastify;
};

export default buildForTests;

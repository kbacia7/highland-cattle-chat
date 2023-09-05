import Fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyCookie from "@fastify/cookie";

import { PrismaClient } from "@prisma/client";

import realTimeRoute from "@routes/realTime";
import loginUserRoute from "@routes/login";

import restrictedContext from "@contexts/restrictedContext";

import { FAKE_COOKIE_SECRET } from "./consts";

import type { FastifyInstance } from "fastify";

const buildForTests = () => {
  const fastify: FastifyInstance = Fastify();
  fastify.register(fastifyCookie, {
    secret: FAKE_COOKIE_SECRET,
  });

  fastify.register(fastifyWebsocket);
  fastify.decorate("prisma", new PrismaClient());
  fastify.register(realTimeRoute);
  fastify.register(loginUserRoute);
  fastify.register(restrictedContext);

  return fastify;
};

export default buildForTests;

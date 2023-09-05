import Fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyCookie from "@fastify/cookie";
import cors from "@fastify/cors";

import restrictedContext from "@contexts/restrictedContext";

import realTimeRoute from "@routes/realTime";
import loginUserRoute from "@routes/login";
import createFakeUserRoute from "@routes/createFakeUser";

import prismaConnector from "./prismaConnector";

import type {
  FastifyHttpOptions,
  RawServerDefault,
  FastifyBaseLogger,
  FastifyInstance,
} from "fastify";

const build = (
  opts?: FastifyHttpOptions<RawServerDefault, FastifyBaseLogger> | undefined,
) => {
  const fastify: FastifyInstance = Fastify(opts);
  fastify.register(cors, {
    origin: true,
    credentials: true,
    allowedHeaders: ["Content-Type", "Cookies", "Cookie", "Set-Cookie"],
    exposedHeaders: ["Set-Cookie"],
    methods: ["GET", "POST"],
    maxAge: 86400,
  });

  fastify.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
  });
  fastify.register(fastifyWebsocket);
  fastify.register(prismaConnector);
  fastify.register(realTimeRoute);
  fastify.register(loginUserRoute);
  fastify.register(restrictedContext);
  if (process.env.NODE_ENV === "development")
    fastify.register(createFakeUserRoute);

  return fastify;
};

export default build;

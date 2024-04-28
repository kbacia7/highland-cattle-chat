import Fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyMultipart from "@fastify/multipart";
import fastifyCookie from "@fastify/cookie";
import cors from "@fastify/cors";

import restrictedContext from "@contexts/restrictedContext";

import registerUserRoute from "@routes/register";
import loginUserRoute from "@routes/login";

import prismaPlugin from "./plugins/prisma";
import googleStoragePlugin from "./plugins/googleStorage";
import cachePlugin from "./plugins/redis";
import serverIdPlugin from "./plugins/serverId";
import guideUserPlugin from "./plugins/guideUser";

import type { Server } from "https";
import type {
  FastifyHttpsOptions,
  FastifyBaseLogger,
  FastifyInstance,
  FastifyHttpOptions,
} from "fastify";

const build = async (
  opts?:
    | FastifyHttpsOptions<Server, FastifyBaseLogger>
    | FastifyHttpOptions<Server, FastifyBaseLogger>
    | undefined,
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

  await fastify.register(prismaPlugin);
  await fastify.register(googleStoragePlugin);
  await fastify.register(cachePlugin);
  await fastify.register(serverIdPlugin);
  fastify.register(registerUserRoute);
  fastify.register(loginUserRoute);
  fastify.register(restrictedContext);
  await fastify.register(guideUserPlugin);
  return fastify;
};

export default build;

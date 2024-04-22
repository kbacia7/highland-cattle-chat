import Fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyMultipart from "@fastify/multipart";
import fastifyCookie from "@fastify/cookie";
import cors from "@fastify/cors";

import restrictedContext from "@contexts/restrictedContext";

import registerUserRoute from "@routes/register";
import loginUserRoute from "@routes/login";

import prismaConnector from "./prismaConnector";
import googleStorageConnector from "./googleStorageConnector";
import cacheConnector from "./cacheConnector";
import workersConnector from "./workersConnector";

import findGuideUser from "./findGuideUser";
import serverId from "./serverId";

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

  await fastify.register(prismaConnector);
  await fastify.register(googleStorageConnector);
  await fastify.register(cacheConnector);
  await fastify.register(serverId);
  fastify.register(workersConnector);
  fastify.register(registerUserRoute);
  fastify.register(loginUserRoute);
  fastify.register(restrictedContext);
  await fastify.register(findGuideUser);
  return fastify;
};

export default build;

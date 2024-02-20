import Fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyMultipart from "@fastify/multipart";
import fastifyCookie from "@fastify/cookie";
import cors from "@fastify/cors";

import restrictedContext from "@contexts/restrictedContext";

import realTimeRoute from "@routes/realTime";
import registerUserRoute from "@routes/register";
import loginUserRoute from "@routes/login";
import createFakeUserRoute from "@routes/createFakeUser";

import prismaConnector from "./prismaConnector";
import cacheConnector from "./cacheConnector";
import workersConnector from "./workersConnector";

import createGuideUser from "./createGuideUser";

import type { Server } from "https";
import type {
  FastifyHttpsOptions,
  FastifyBaseLogger,
  FastifyInstance,
} from "fastify";

const build = (
  opts?: FastifyHttpsOptions<Server, FastifyBaseLogger> | undefined,
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
  fastify.register(prismaConnector);
  fastify.register(cacheConnector);
  fastify.register(workersConnector);
  fastify.register(realTimeRoute);
  fastify.register(registerUserRoute);
  fastify.register(loginUserRoute);
  fastify.register(restrictedContext);
  fastify.register(createGuideUser);
  if (process.env.NODE_ENV === "development")
    fastify.register(createFakeUserRoute);

  return fastify;
};

export default build;

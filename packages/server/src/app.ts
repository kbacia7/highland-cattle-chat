import Fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyCookie from "@fastify/cookie";

import restrictedContext from "@contexts/restrictedContext";

import realTimeRoute from "@routes/realTime";
import loginUserRoute from "@routes/login";

import fireStoreConnector from "./fireStoreConnector";

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
  fastify.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
  });
  fastify.register(fastifyWebsocket);
  fastify.register(fireStoreConnector);
  fastify.register(realTimeRoute);
  fastify.register(loginUserRoute);
  fastify.register(restrictedContext);

  return fastify;
};

export default build;

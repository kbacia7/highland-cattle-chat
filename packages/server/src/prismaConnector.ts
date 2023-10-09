import fp from "fastify-plugin";
import { XXH64 } from "xxh3-ts";

import { PrismaClient, Prisma } from "@prisma/client";

import type {
  FastifyInstance as LegalFastifyInstance,
  FastifyPluginCallback,
  FastifyInstance,
} from "fastify";
import type { CacheOptions } from "./types/prismaConnector";

const cacheQuery = async (
  model: string | undefined,
  // @ts-ignore
  args,
  // @ts-ignore
  query,
  fastify: FastifyInstance,
) => {
  if (!args) return query(args);

  const { cache, ...rest } = args;
  if (cache?.ttl !== undefined) {
    const key = `${model}${XXH64(Buffer.from(JSON.stringify(rest))).toString(
      16,
    )}`;

    const cached = await fastify.cache.get(key);
    if (!cached) {
      const res = await query(rest);
      fastify.cache.set(key, JSON.stringify(res));
      fastify.cache.expire(key, cache.ttl || 10);
      return res;
    }

    return JSON.parse(cached);
  }

  return query(rest);
};

function cachingExtension(fastify: LegalFastifyInstance) {
  return Prisma.defineExtension((prisma) =>
    prisma.$extends({
      name: "caching",
      model: {
        $allModels: {
          async findFirst<T, A>(
            this: T,
            args?: Prisma.Exact<A, Prisma.Args<T, "findFirst"> & CacheOptions>,
          ): Promise<Prisma.Result<T, A, "findFirst">> {
            const context = Prisma.getExtensionContext(this);
            // @ts-ignore
            const model = context.$parent[context.$name];

            const cached = await cacheQuery(
              context.$name,
              args,
              model.findFirst,
              fastify,
            );

            return cached;
          },

          async findFirstOrThrow<T, A>(
            this: T,
            args?: Prisma.Exact<
              A,
              Prisma.Args<T, "findFirstOrThrow"> & CacheOptions
            >,
          ): Promise<Prisma.Result<T, A, "findFirstOrThrow">> {
            const context = Prisma.getExtensionContext(this);
            // @ts-ignore
            const model = context.$parent[context.$name];

            const cached = await cacheQuery(
              context.$name,
              args,
              model.findFirstOrThrow,
              fastify,
            );

            return cached;
          },

          async findUnique<T, A>(
            this: T,
            args: Prisma.Exact<A, Prisma.Args<T, "findUnique"> & CacheOptions>,
          ): Promise<Prisma.Result<T, A, "findUnique">> {
            const context = Prisma.getExtensionContext(this);
            // @ts-ignore
            const model = context.$parent[context.$name];

            const cached = await cacheQuery(
              context.$name,
              args,
              model.findUnique,
              fastify,
            );

            return cached;
          },

          async findUniqueOrThrow<T, A>(
            this: T,
            args: Prisma.Exact<
              A,
              Prisma.Args<T, "findUniqueOrThrow"> & CacheOptions
            >,
          ): Promise<Prisma.Result<T, A, "findUniqueOrThrow">> {
            const context = Prisma.getExtensionContext(this);
            // @ts-ignore
            const model = context.$parent[context.$name];

            const cached = await cacheQuery(
              context.$name,
              args,
              model.findUniqueOrThrow,
              fastify,
            );

            return cached;
          },

          async findMany<T, A>(
            this: T,
            args?: Prisma.Exact<A, Prisma.Args<T, "findMany"> & CacheOptions>,
          ): Promise<Prisma.Result<T, A, "findMany">> {
            const context = Prisma.getExtensionContext(this);
            // @ts-ignore
            const model = context.$parent[context.$name];

            const cached = await cacheQuery(
              context.$name,
              args,
              model.findMany,
              fastify,
            );

            return cached;
          },
        },
      },
    }),
  );
}

export const createPrismaClient = (fastify: LegalFastifyInstance) =>
  new PrismaClient().$extends(cachingExtension(fastify));

const prismaConnector: FastifyPluginCallback = async (
  fastify,
  options,
  done,
) => {
  const prisma = createPrismaClient(fastify);
  if (!fastify.prisma) {
    fastify.decorate("prisma", prisma);
  }

  done();
};

export default fp(prismaConnector, { name: "fastify-prisma" });

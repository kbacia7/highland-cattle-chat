import { v4 as uuidv4 } from "uuid";
import { fileTypeFromBuffer } from "file-type";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import { updateAccountSchema } from "@highland-cattle-chat/shared";

import { Storage } from "@google-cloud/storage";

import hashPassword from "@helpers/hashPassword";

import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { FileTypeResult } from "file-type";

const ACCEPTED_PROFILE_PICTURE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const isCorrectFileType = (
  fileType: FileTypeResult | undefined,
): fileType is FileTypeResult =>
  ACCEPTED_PROFILE_PICTURE_TYPES.includes(fileType?.mime || "");

const updateAccountRoute = async (fastify: FastifyInstance) => {
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/update-account",
    {
      logLevel: "debug",
      schema: {
        body: updateAccountSchema,
      },
    },
    async (req, reply) => {
      const userExists = await fastify.prisma.user.findFirst({
        where: {
          email: req.body.email,
          id: {
            not: req.loggedUserId,
          },
        },
      });

      const fileType = await fileTypeFromBuffer(req.body.profilePicture);
      if (!isCorrectFileType(fileType)) {
        return reply.code(400).send({
          error: "Incorrect filetype",
        });
      }

      if (userExists)
        return reply.code(403).send({
          error: "User with given e-mail already exists",
        });

      const imageId = uuidv4();
      const storage = new Storage();
      const file = storage
        .bucket(process.env.GOOGLE_STORAGE_BUCKET_NAME || "")
        .file(`${imageId}.${fileType.ext}`);

      await file.save(req.body.profilePicture);

      const updatedUser = await fastify.prisma.user.update({
        where: {
          id: req.loggedUserId,
        },
        data: {
          displayName: req.body.displayName,
          password: await hashPassword(req.body.password),
          email: req.body.email,
          image: file.publicUrl(),
        },
      });

      return reply.send({
        ...updatedUser,
        password: undefined,
      });
    },
  );
};

export default updateAccountRoute;

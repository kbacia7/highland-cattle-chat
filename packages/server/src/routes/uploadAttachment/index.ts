import path from "path";

import { nanoid } from "nanoid";
import { fileTypeFromBuffer } from "file-type";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import {
  ACCEPTED_ATTACHMENT_TYPES,
  uploadAttachmentSchema,
} from "@highland-cattle-chat/shared";

import type { UploadAttachmentResponse } from "@highland-cattle-chat/shared";

import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { FileTypeResult } from "file-type";

const isCorrectFileType = (
  fileType: FileTypeResult | undefined,
): fileType is FileTypeResult =>
  ACCEPTED_ATTACHMENT_TYPES.includes(fileType?.mime || "");

const updateAccountRoute = async (fastify: FastifyInstance) => {
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/upload-attachment",
    {
      schema: {
        body: uploadAttachmentSchema,
      },
    },
    async (req, reply) => {
      const fileType = await fileTypeFromBuffer(req.body.image);
      if (!isCorrectFileType(fileType)) {
        return reply.code(400).send({
          error: "Incorrect filetype",
        });
      }

      const imageId = nanoid(8);
      const file = fastify.storageBucket.file(`${imageId}.${fileType.ext}`);
      await file.save(req.body.image);

      return reply.send({
        attachment: path.basename(file.publicUrl()),
      } as UploadAttachmentResponse);
    },
  );
};

export default updateAccountRoute;

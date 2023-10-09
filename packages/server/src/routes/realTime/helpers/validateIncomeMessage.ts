import Ajv from "ajv";
import fastUri from "fast-uri";

import type { JSONSchemaType } from "ajv";
import type { IncomeMessage } from "@highland-cattle-chat/shared";

const ajv = new Ajv({
  coerceTypes: "array",
  useDefaults: true,
  removeAdditional: true,
  uriResolver: fastUri,
  addUsedSchema: false,
  allErrors: false,
});

const incomeMessageSchema: JSONSchemaType<IncomeMessage> = {
  type: "object",
  $id: "/schemas/incoming-message.json",
  properties: {
    type: { type: "string" },
    userId: { type: "string" },
    content: { type: "string", nullable: true },
    conversationId: { type: "string", nullable: true },
  },
  required: ["userId", "type"],
};

const validateIncomeMessage = ajv.compile(incomeMessageSchema);

export default validateIncomeMessage;

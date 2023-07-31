import Ajv, { type JSONSchemaType } from "ajv";
import fastUri from "fast-uri";
import type { IncomeMessage } from "@/types/messages";

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
    senderPublicKey: { type: "string" },
    recipientPublicKey: { type: "string", nullable: true },
    content: { type: "string", nullable: true },
  },
  required: ["senderPublicKey", "type"],
};

const validateIncomeMessage = ajv.compile(incomeMessageSchema);

export default validateIncomeMessage;

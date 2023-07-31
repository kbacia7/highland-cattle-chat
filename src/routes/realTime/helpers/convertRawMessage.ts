import type { IncomeMessage } from "@/types/messages";

const convertRawMessage = (message: string) => {
  try {
    return JSON.parse(message) as IncomeMessage;
  } catch (e) {
    return undefined;
  }
};

export default convertRawMessage;

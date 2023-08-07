import type { IncomeMessage } from "@highland-cattle-chat/shared";

const convertRawMessage = (message: string) => {
  try {
    return JSON.parse(message) as IncomeMessage;
  } catch (e) {
    return undefined;
  }
};

export default convertRawMessage;

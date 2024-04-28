import { generatePath } from "react-router-dom";

export const HOME_URL_SCHEMA = "/home";
export const CONVERSATION_URL_SCHEMA = "/conversation/:id";

export const generateHomeUrl = () => generatePath(HOME_URL_SCHEMA);
export const generateConversationUrl = (id: string) =>
  generatePath(CONVERSATION_URL_SCHEMA, { id });

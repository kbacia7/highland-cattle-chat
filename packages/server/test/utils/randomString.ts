import { v4 as uuidv4 } from "uuid";

const generateString = (len: number, step = 0, str = ""): string => {
  if (step >= len) return str;
  return generateString(len, step + 1, str + uuidv4());
};

export default generateString;

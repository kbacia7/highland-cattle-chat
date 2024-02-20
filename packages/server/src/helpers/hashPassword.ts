import bcrypt from "bcrypt";

const hashPassword = async (password: string) => bcrypt.hash(password, 10);

export default hashPassword;

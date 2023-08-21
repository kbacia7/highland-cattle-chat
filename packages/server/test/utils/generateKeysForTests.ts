import * as openpgp from "openpgp";
import { v4 as uuidv4 } from "uuid";

export type TestKeyPair = {
  publicKey: string;
  privateKey: string;
  revocationCertificate: string;
  passphrase: string;
};

const generateKeysForTests = async (): Promise<TestKeyPair> => {
  const passphrase = uuidv4();
  const { publicKey, privateKey, revocationCertificate } =
    await openpgp.generateKey({
      passphrase,
      format: "armored",
      userIDs: [
        {
          name: "server",
          email: "server@server.com",
          comment: "Key generated for tests",
        },
      ],
      keyExpirationTime: 60,
    });

  return { publicKey, privateKey, revocationCertificate, passphrase };
};

export default generateKeysForTests;

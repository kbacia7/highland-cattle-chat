import * as openpgp from "openpgp";

import type { FastifyInstance } from "fastify";

const authorize = async (
  privateKey: string,
  passphrase: string,
  alias: string,
  fastify: FastifyInstance,
) => {
  const userPrivateKey = await openpgp.decryptKey({
    privateKey: await openpgp.readPrivateKey({
      armoredKey: privateKey,
    }),
    passphrase,
  });

  const response = await fastify.inject({
    method: "POST",
    url: "/login",
    body: {
      signedAlias: await openpgp.sign({
        message: await openpgp.createCleartextMessage({ text: alias }),
        signingKeys: userPrivateKey,
      }),
    },
  });

  return `session=${
    response.cookies.find(({ name }) => name === "session")?.value
  };`;
};

export default authorize;

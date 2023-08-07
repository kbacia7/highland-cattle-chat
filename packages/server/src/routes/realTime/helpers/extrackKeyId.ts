import * as openpgp from "openpgp";

const extractKeyId = async (armoredKey: string) => {
  try {
    return (
      await openpgp.readKey({
        armoredKey,
      })
    )
      .getKeyID()
      .toHex();
  } catch (e) {
    return undefined;
  }
};

export default extractKeyId;

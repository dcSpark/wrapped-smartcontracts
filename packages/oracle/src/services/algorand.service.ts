import algosdk from "algosdk";
import nacl from "tweetnacl";

export const verifySignature = (
  signedTx: algosdk.SignedTransaction,
  key: Buffer,
  mainchainAddress: string
) => {
  if (signedTx.sig === undefined) return false;

  const signedBytes = signedTx.txn.bytesToSign();

  return (
    nacl.sign.detached.verify(signedBytes, signedTx.sig, key) &&
    mainchainAddress === algosdk.encodeAddress(signedTx.txn.from.publicKey)
  );
};

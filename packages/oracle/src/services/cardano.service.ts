import {
  Ed25519Signature,
  PublicKey,
  Address,
  BaseAddress,
  StakeCredential,
} from "@dcspark/cardano-multiplatform-lib-nodejs";
import { COSEKey, COSESign1, Label, Int } from "@emurgo/cardano-message-signing-nodejs";

export const verifySignature = (signature: Buffer, key: Buffer, mainchainAddress: Address) => {
  const coseSign1 = COSESign1.from_bytes(signature);
  const coseKey = COSEKey.from_bytes(key);

  const pkBytes = coseKey.header(Label.new_int(Int.new_i32(-2))).as_bytes();

  const sigStructReconstructed = coseSign1.signed_data().to_bytes();
  const sig = Ed25519Signature.from_bytes(coseSign1.signature());

  const pk = PublicKey.from_bytes(pkBytes);

  return pk.verify(sigStructReconstructed, sig) && verifyAddress(mainchainAddress, pk);
};

export const verifyAddress = (address: Address, publicKey: PublicKey): boolean => {
  const newAddress = BaseAddress.new(
    address.network_id(),
    StakeCredential.from_keyhash(publicKey.hash()),
    address.staking_cred()
  );

  return newAddress.to_address().to_bech32() === address.to_bech32();
};

export const getMainchainAddressFromSignature = (signature: Buffer): Address => {
  const coseSign1 = COSESign1.from_bytes(signature);

  const addressBytes = coseSign1
    .headers()
    .protected()
    .deserialized_headers()
    .header(Label.new_text("address"))
    .as_bytes();

  return Address.from_bytes(addressBytes);
};

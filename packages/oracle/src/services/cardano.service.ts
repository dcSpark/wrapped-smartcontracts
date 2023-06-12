import {
  Ed25519Signature,
  PublicKey,
  Address,
  BaseAddress,
  StakeCredential,
  EnterpriseAddress,
} from "@dcspark/cardano-multiplatform-lib-nodejs";
import { COSEKey, COSESign1, Label, Int } from "@emurgo/cardano-message-signing-nodejs";

export const verifySignature = (
  coseSign1: COSESign1,
  coseKey: COSEKey,
  mainchainAddress: Address
) => {
  const pkBytes = coseKey.header(Label.new_int(Int.new_i32(-2)))?.as_bytes();

  if (!pkBytes) {
    throw new Error("No public key in COSE key");
  }

  const sigStructReconstructed = coseSign1.signed_data().to_bytes();
  const sig = Ed25519Signature.from_bytes(coseSign1.signature());

  const pk = PublicKey.from_bytes(pkBytes);

  return pk.verify(sigStructReconstructed, sig) && verifyAddress(mainchainAddress, pk);
};

export const verifyAddress = (address: Address, publicKey: PublicKey): boolean => {
  const stakeCred = address.staking_cred();

  let newAddress;

  if (stakeCred === undefined) {
    newAddress = EnterpriseAddress.new(
      address.network_id(),
      StakeCredential.from_keyhash(publicKey.hash())
    );
  } else {
    newAddress = BaseAddress.new(
      address.network_id(),
      StakeCredential.from_keyhash(publicKey.hash()),
      stakeCred
    );
  }

  return newAddress.to_address().to_bech32() === address.to_bech32();
};

export const getMainchainAddressFromSignature = (coseSign1: COSESign1): Address => {
  const addressBytes = coseSign1
    .headers()
    .protected()
    .deserialized_headers()
    .header(Label.new_text("address"))
    ?.as_bytes();

  if (addressBytes === undefined) {
    throw new Error("Invalid header");
  }

  return Address.from_bytes(addressBytes);
};

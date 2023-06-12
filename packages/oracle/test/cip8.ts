import { Address, PrivateKey, PublicKey } from "@dcspark/cardano-multiplatform-lib-nodejs";
import {
  COSESign1,
  HeaderMap,
  Label,
  AlgorithmId,
  CBORValue,
  ProtectedHeaderMap,
  CBORSpecial,
  Headers,
  COSESign1Builder,
  Int,
  COSEKey,
  KeyType,
} from "@emurgo/cardano-message-signing-nodejs";

export const buildSign1 = (
  payload: Uint8Array,
  sk: PrivateKey,
  adaAddressBech32: string
): COSESign1 => {
  const address = Address.from_bech32(adaAddressBech32);

  const protectedHeaders = HeaderMap.new();
  protectedHeaders.set_algorithm_id(Label.from_algorithm_id(AlgorithmId.EdDSA));
  protectedHeaders.set_header(Label.new_text("address"), CBORValue.new_bytes(address.to_bytes()));

  const protectedSerialized = ProtectedHeaderMap.new(protectedHeaders);

  const unprotectedHeaders = HeaderMap.new();
  unprotectedHeaders.set_header(
    Label.new_text("hashed"),
    CBORValue.new_special(CBORSpecial.new_bool(false))
  );

  const headers = Headers.new(protectedSerialized, unprotectedHeaders);

  const sign1Builder = COSESign1Builder.new(headers, payload, false);

  const sigStruct = sign1Builder.make_data_to_sign().to_bytes();

  const signedSigStruct = sk.sign(sigStruct).to_bytes();

  return sign1Builder.build(signedSigStruct);
};

export const buildKey = (pk: PublicKey): COSEKey => {
  const coseKey = COSEKey.new(Label.from_key_type(KeyType.OKP));

  coseKey.set_algorithm_id(Label.from_algorithm_id(AlgorithmId.EdDSA));
  coseKey.set_header(Label.new_int(Int.new_i32(-1)), CBORValue.new_int(Int.new_i32(6)));

  coseKey.set_header(Label.new_int(Int.new_i32(-2)), CBORValue.new_bytes(pk.as_bytes()));

  return coseKey;
};

export const signCIP8 = (
  payload: Uint8Array,
  privateKeyBech32: string,
  adaAddressBech32: string
): { coseSign1: COSESign1; coseKey: COSEKey } => {
  const sk = PrivateKey.from_bech32(privateKeyBech32);

  return {
    coseSign1: buildSign1(payload, sk, adaAddressBech32),
    coseKey: buildKey(sk.to_public()),
  };
};

export default {
  buildSign1,
  buildKey,
  signCIP8,
};

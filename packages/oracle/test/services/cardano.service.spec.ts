import { Address } from "@dcspark/cardano-multiplatform-lib-nodejs";
import { COSEKey, COSESign1 } from "@emurgo/cardano-message-signing-nodejs";
import { expect } from "chai";
import {
  getMainchainAddressFromSignature,
  verifySignature,
} from "../../src/services/cardano.service";

describe("Cardano cip-8 service", () => {
  it("should verify signature", () => {
    const address =
      "addr_test1qz5dj9dh8cmdxvtr4jh3kca8rjw0vjt4anz79k4aefh9wcjjvmavqj3jhujkkn4kpz9ky09xhtt4v3447fesn7ptkfvsa0ymyn";
    const key =
      "a4010103272006215820a0057bf300a1fafa83a429a725775db34370472376e27ab634c4032170a72324";
    const sign =
      "845846a201276761646472657373583900a8d915b73e36d33163acaf1b63a71c9cf64975ecc5e2dabdca6e57625266fac04a32bf256b4eb6088b623ca6bad75646b5f27309f82bb259a166686173686564f44501020304055840cf4b6735681c7c4e14faadc7ea0a416e994b30ed3b44589faaeb3893fed56566ab48701c95859710ddf55c707f543892627f7cd660bdfea86e3b766c921d5a03";

    const coseKey = COSEKey.from_bytes(Buffer.from(key, "hex"));
    const coseSign1 = COSESign1.from_bytes(Buffer.from(sign, "hex"));

    expect(verifySignature(coseSign1, coseKey, Address.from_bech32(address))).to.be.true;
  });

  it("should detect incorrect address", () => {
    // different address
    const address =
      "addr_test1qrhtzksm78slgfypumge0qv8k73fzg4ul7c0pwuk56xxw3445wq8vu5m3lqwremlt7erutjem9622qne4xcy28quut0smg0ckh";
    const key =
      "a4010103272006215820a0057bf300a1fafa83a429a725775db34370472376e27ab634c4032170a72324";
    const sign =
      "845846a201276761646472657373583900a8d915b73e36d33163acaf1b63a71c9cf64975ecc5e2dabdca6e57625266fac04a32bf256b4eb6088b623ca6bad75646b5f27309f82bb259a166686173686564f44501020304055840cf4b6735681c7c4e14faadc7ea0a416e994b30ed3b44589faaeb3893fed56566ab48701c95859710ddf55c707f543892627f7cd660bdfea86e3b766c921d5a03";

    const coseKey = COSEKey.from_bytes(Buffer.from(key, "hex"));
    const coseSign1 = COSESign1.from_bytes(Buffer.from(sign, "hex"));

    expect(verifySignature(coseSign1, coseKey, Address.from_bech32(address))).to.be.false;
  });

  it("should detect incorrect key", () => {
    const address =
      "addr_test1qz5dj9dh8cmdxvtr4jh3kca8rjw0vjt4anz79k4aefh9wcjjvmavqj3jhujkkn4kpz9ky09xhtt4v3447fesn7ptkfvsa0ymyn";

    // different key
    const key =
      "a40101032720062158201ddca651fe2488e9c5a8b50ae05af40f7274157c163a3cfc964827a9bc399cd0";
    const sign =
      "845846a201276761646472657373583900a8d915b73e36d33163acaf1b63a71c9cf64975ecc5e2dabdca6e57625266fac04a32bf256b4eb6088b623ca6bad75646b5f27309f82bb259a166686173686564f44501020304055840cf4b6735681c7c4e14faadc7ea0a416e994b30ed3b44589faaeb3893fed56566ab48701c95859710ddf55c707f543892627f7cd660bdfea86e3b766c921d5a03";

    const coseKey = COSEKey.from_bytes(Buffer.from(key, "hex"));
    const coseSign1 = COSESign1.from_bytes(Buffer.from(sign, "hex"));

    expect(verifySignature(coseSign1, coseKey, Address.from_bech32(address))).to.be.false;
  });

  it("should get correct address", () => {
    const expectedAddress =
      "addr_test1qz5dj9dh8cmdxvtr4jh3kca8rjw0vjt4anz79k4aefh9wcjjvmavqj3jhujkkn4kpz9ky09xhtt4v3447fesn7ptkfvsa0ymyn";

    const sign =
      "845846a201276761646472657373583900a8d915b73e36d33163acaf1b63a71c9cf64975ecc5e2dabdca6e57625266fac04a32bf256b4eb6088b623ca6bad75646b5f27309f82bb259a166686173686564f44501020304055840cf4b6735681c7c4e14faadc7ea0a416e994b30ed3b44589faaeb3893fed56566ab48701c95859710ddf55c707f543892627f7cd660bdfea86e3b766c921d5a03";

    const coseSign1 = COSESign1.from_bytes(Buffer.from(sign, "hex"));

    expect(getMainchainAddressFromSignature(coseSign1).to_bech32()).to.equal(expectedAddress);
  });
});

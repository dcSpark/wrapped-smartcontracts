import { ethers } from "ethers";
import { MilkomedaProvider } from "./types";

export const getActorAddress = async (
  provider: MilkomedaProvider,
  mainchainAddress: string,
  salt?: ethers.BytesLike
) => {
  const functionSignature = ethers.utils
    .keccak256(ethers.utils.toUtf8Bytes("getActorAddress(string,bytes32)"))
    .slice(0, 10);

  const callData = ethers.utils.hexConcat([
    functionSignature,
    ethers.utils.defaultAbiCoder.encode(
      ["string", "bytes32"],
      [mainchainAddress, salt ?? ethers.constants.HashZero]
    ),
  ]);

  const result = await provider.providerRequest<string>({
    method: "eth_call",
    params: [{ to: provider.actorFactoryAddress, data: callData }, "latest"],
  });

  return ethers.utils.defaultAbiCoder.decode(["address"], result)[0];
};

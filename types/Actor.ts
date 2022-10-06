import { BytesLike } from "ethers";

export interface ActorConstructorArgs {
  executeArgs: BytesLike;
  executeConditionArgs: BytesLike;
}

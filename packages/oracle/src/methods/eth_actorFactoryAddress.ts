import { z } from "zod";
import latestActorVersion from "../../actor-latest-version.json";
import config from "../config";
import validationMiddleware from "./validationMiddleware";

const actorVersionSchema = z
  .number()
  .optional()
  .nullable()
  .refine(
    (actorVersion) =>
      actorVersion === undefined || actorVersion === null || actorVersion <= latestActorVersion,
    {
      message: "Invalid actor version",
    }
  );

const InputSchema = z.union([z.tuple([]), z.tuple([actorVersionSchema])]);

const eth_actorFactoryAddress = ([actorVersion]: z.infer<typeof InputSchema>) => {
  if (actorVersion === undefined || actorVersion === null) {
    return config.v2ActorFactoryAddress;
  }

  switch (actorVersion) {
    case 1:
      return config.v1ActorFactoryAddress;
    case 2:
      return config.v2ActorFactoryAddress;
    default:
      throw new Error(`ActorFactory version ${actorVersion} is not supported`);
  }
};

export default validationMiddleware(InputSchema.parse, eth_actorFactoryAddress);

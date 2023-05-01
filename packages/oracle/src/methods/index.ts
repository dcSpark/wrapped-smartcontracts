import { SimpleJSONRPCMethod } from "json-rpc-2.0";
import eth_actorFactoryAddress from "./eth_actorFactoryAddress";
import eth_getActorNonce from "./eth_getActorNonce";
import eth_sendAdaActorTransaction from "./eth_sendAdaActorTransaction";
import ping from "./ping";

const methods: { [key: string]: SimpleJSONRPCMethod } = {
  eth_actorFactoryAddress,
  eth_getActorNonce,
  eth_sendAdaActorTransaction,
  ping,
};

export default methods;

import { flint } from "./connectors/flint";
import { etrnal } from "./connectors/etrnal";

export const getWallets = () => {
  return [flint(), etrnal()];
};

export const getBridgeExplorerUrl = (id: number | undefined) => {
  if (id == 2001) return "https://bridge-explorer.milkomeda.com/cardano-mainnet";
  return "https://bridge-explorer.milkomeda.com/cardano-devnet";
};
export const getEvmExplorerUrl = (id: number | undefined) => {
  if (id == 2001) return "https://explorer-mainnet-cardano-evm.c1.milkomeda.com";
  return "https://explorer-devnet-cardano-evm.c1.milkomeda.com";
};

export const getDefaultTokenByChainId = (id: number | undefined) => {
  if (id == 2001) return "ADA";
  return "TADA";
};

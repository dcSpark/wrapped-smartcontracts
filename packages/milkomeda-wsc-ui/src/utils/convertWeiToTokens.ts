import BigNumber from "bignumber.js";

export const convertWeiToTokens = ({ valueWei, token }) =>
  new BigNumber(valueWei).dividedBy(new BigNumber(10).pow(token.decimals)).dp(+token.decimals);

export const convertTokensToWei = ({ value, token }) =>
  new BigNumber(value).multipliedBy(new BigNumber(10).pow(token.decimals)).dp(0);

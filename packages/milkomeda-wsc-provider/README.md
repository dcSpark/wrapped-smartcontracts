# Provider

Injects the provider for wrapped smart contracts into:
1. [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) - the `window.ethereum` object
2. [EIP-6963](https://eips.ethereum.org/EIPS/eip-6963) with rdns `com.milkomeda.c1.wsc` / `com.milkomeda.a1.wsc` and UUID `d53bc7c3-e43a-4d0a-83d7-b6e7b7504beb`

This provider invokes a L1 provider to abstract the Milkomeda account on L2.

To see an example usage of this provider see the [example dapp](../dapp-example/).

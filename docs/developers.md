# For developers

Wrapped smart contracts is a protocol that enables executing of layer 2 smart contracts from the layer 1 wallet. The protocol provides the interface for dapps to communicate with the layer 1 wallet, through the provider object. The provider object is based on the [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) standard and operates as the bridge between the evm provider and the layer 1 provider. This way the evm dapp can communicate with the layer 1 wallet and execute transactions on the layer 2 smart contracts.

## Dapp setup

To use the wrapped smart contracts protocol the dapp needs to inject the provider from the [provider package](../packages/provider/). The example can be found in the [example dapp](../packages/dapp-example/src/App.tsx).
The provider takes two arguments, the oracle url and the regular node json-rpc api url. After injecting the dapp won't use the default evm provider, but the injected provider connecting the layer 1 wallet. To switch between those, we recommend saving a reference to the old provider.

The provider customizes few json-rpc methods like `eth_sendTransaction`, `eth_requestAccounts` etc. that interact with the wallet and sends the other to the json-rpc api. This way the most of the dapp interactions should work plug'n'play.

```typescript
const oldProvider = window.ethereum;
const provider = await import("milkomeda-wsc-provider");
await provider.inject(oracleUrl, nodeUrl).setup();
```

To switch back to the old provider, for example the MetaMask.

```typescript
window.ethereum = oldProvider;
```

## Actor Address

Under the hood the protocol creates an account abstraction called `Actor` that is bound to the specific L1 address. The actor is deployed on the layer 2 and is used to execute transactions on behalf of the user. The actor address is derived from the l1 address using the `CREATE2` opcode.

When prompting the provider with `eth_accounts` it will take the L1 address and derive the actor address, which acts as the user's account on the L2.

On the `eth_sendTransaction` the provider prompts the L1 wallet to sign the raw L2 transaction and sends it to the oracle. The oracle will verify the signature and execute the transaction on the actor.

## Gas payments

The gas is being paid by the Actor smart contract itself, therefore to execute any transaction the actor needs to have enough balance to pay gas. To fund the Actor smart contract the user should use bridge or dapp should prompt the wallet to send the funds to the Actor through the bridge. More on this can be found in the [milkomeda documentation](https://dcspark.github.io/milkomeda-documentation/).

## Sending assets

If the application requires L1 assets it is necessary that they belong to the Actor smart contract. For example to use the DEX, the user needs to first move assets to the Actor smart contract through the Milkomeda bridge, then he can use the L2 dapp in the regular fashion with the L1 wallet, and then the assets will need to be moved back to the L1 through the bridge.

## Full roundtrip of assets example

### Wrapping of assets

```typescript
import { ethers } from "ethers";
import { Blockfrost, Lucid } from "lucid-cardano";

const milkomedaProvider = await import("milkomeda-wsc-provider");
await milkomedaProvider.inject(oracleUrl, nodeUrl).setup();

const amount = 10;

const provider = new ethers.providers.Web3Provider(window.ethereum);

const signer = provider.getSigner();
const actorAddress = await signer.getAddress();

const lucid = await getLucid(BLOCKFROST_API_KEY);

const api = await window.cardano.enable();

lucid.selectWallet(api);

const tx = await lucid
  .newTx()
  .payToAddress(STARGATE_ADDRESS, { lovelace: BigInt(amount * 10 ** 6) })
  .attachMetadata(87, "devnet.cardano-evm.c1")
  .attachMetadata(88, actorAddress)
  .complete();

const signedTx = await tx.sign().complete();

const txHash = await signedTx.submit();
```

### Calling destination contract

```typescript
import { ethers } from "ethers";

const milkomedaProvider = await import("milkomeda-wsc-provider");
await milkomedaProvider.inject(oracleUrl, nodeUrl).setup();

const amount = 10;

const provider = new ethers.providers.Web3Provider(window.ethereum);

const signer = provider.getSigner();

const contract = new ethers.Contract(address, abi, provider);

const tx = await contract.connect(signer).someMethod(params, {
  gasLimit: 1_000_000,
  value: ethers.utils.parseEther(amount.toString()),
});

const receipt = await tx.wait();
```

### Unwrapping of assets

```typescript
import { ethers } from "ethers";

const milkomedaProvider = await import("milkomeda-wsc-provider");
await milkomedaProvider.inject(oracleUrl, nodeUrl).setup();

const amount = 10;

const provider = new ethers.providers.Web3Provider(window.ethereum);

const signer = provider.getSigner();

const bridgeContract = new ethers.Contract(bridgeAddress, bridgeAbi, provider);

await bridgeContract.connect(signer).submitUnwrappingRequest(
  {
    assetId: "0x0000000000000000000000000000000000000000000000000000000000000000",
    from: await signer.getAddress(),
    to: cardanoDestination,
    amount,
  },
  { value: amount.add(ethers.utils.parseUnits("1")), gasLimit: 1_000_000 }
);
```

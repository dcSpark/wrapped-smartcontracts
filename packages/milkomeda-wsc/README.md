# Wrapped Smart Contract Library (WSCLib)

WSCLib is a TypeScript library designed to simplify interactions with Wrapped Smart Contracts (WSCs). Leveraging the novel concept of WSCs, this library brings the flexibility of executing smart contracts on sidechains or Layer 2 (L2) networks without users needing to leave their Layer 1 (L1) environment. This seamless experience eliminates the need for wallet switching or understanding the underlying complexities, offering a new user experience paradigm for blockchain interactions.

## Features

WSCLib provides a rich set of features to interact with WSCs:

1. **Network Detection**: It supports various networks, including Cardano and Algorand, with built-in methods to detect the network type.
2. **Wallet Interaction**: The library offers wallet interaction support for wallets like Flint. 
3. **Algorand and Cardano Support**: Algorand and Cardano specific functionalities are encapsulated in dedicated methods.
4. **Bridge Actions**: It provides built-in methods for wrapping and unwrapping assets using the WSC technology.
5. **Transaction Tracking**: It allows tracking of pending transactions and activities.
6. **Balance Retrieval**: It offers methods to retrieve native balances and token balances on both L1 and L2.
7. **Address Retrieval**: Methods for retrieving the current address in the original network.

## Installation

Install the library using npm:

```bash
npm install wsclib
```

## Usage

Here's how you can use WSCLib in your project:

```typescript
import WSCLib, { UserWallet, MilkomedaNetworkName } from 'wsclib';

const network = MilkomedaNetworkName.C1Mainnet;
const wallet = UserWallet.Flint;
const oracleUrl = 'oracleUrl';
const jsonRpcProviderUrl = 'jsonRpcProviderUrl';
const blockfrostKey = 'blockfrostKey';

const wscLib = new WSCLib(network, wallet, {
  oracleUrl,
  jsonRpcProviderUrl,
  blockfrostKey
});

// Inject the library with the necessary dependencies
await wscLib.inject();
```

## Example: Fetch User's Native Balance

```typescript
const balance = await wscLib.origin_getNativeBalance();
console.log(balance); // logs the user's native balance
```

The origin_getNativeBalance() method returns a Promise<string>. The resolved string represents the user's native balance.

## Documentation

In-depth method descriptions, usage examples, and return types can be found in the library's codebase. If further information is required, please reach out to us. We're dedicated to making WSCLib a robust and easy-to-use solution for developers working with WSCs.

## Contribute

WSCLib is open for contributions. We encourage you to contribute to WSCLib and help us improve this library.

## License

WSCLib is MIT licensed.
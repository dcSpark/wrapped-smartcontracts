# Wrapped Smart Contracts

Wrapped Smart Contracts are a new concept aimed at facilitating interaction with smart contracts on sidechains or Layer 2 (L2) solutions without the need for users to directly migrate to these new ecosystems. The Layer 1 (L1) blockchain acts as a robust coordination layer, allowing users to execute smart contracts on sidechains or L2 while remaining on the L1 blockchain. This provides a user-friendly experience, as users can interact with various systems without changing wallets or needing a deep understanding of the underlying processes.

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
npm install milkomeda-wsc
```

## Usage

Here's how you can use WSCLib in your project:

```typescript
import WSCLib, { UserWallet, MilkomedaNetworkName } from 'milkomeda-wsc';

const network = MilkomedaNetworkName.C1Mainnet;
const wallet = "flint"; // replace with the cip30 wallet type of your choice
const oracleUrl = 'oracleUrl'; // replace with the URL for your Oracle
const jsonRpcProviderUrl = 'jsonRpcProviderUrl'; // replace with your RPC URL
const blockfrostKey = 'blockfrostKey'; // replace with your blockfrost key

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

# WSCLib API Documentation

## Class: WSCLib

The WSCLib is a class designed to interact with the blockchain and handle token management.

### Methods

#### `constructor`
- Initializes the instance of the library.
- Parameters: None
- Returns: Instance of WSCLib

#### `isCardano`
- Checks if the current network is Cardano.
- Parameters: None
- Returns: Boolean

#### `isAlgorand`
- Checks if the current network is Algorand.
- Parameters: None
- Returns: Boolean

#### `origin_getTokenBalances(address: string | undefined)`
- Retrieves token balances for a specific address on the blockchain.
- Parameters: 
  - `address` (string, optional): The address for which to retrieve token balances.
- Returns: Promise resolving to an array of `OriginAmount` objects

#### `cardano_origin_getTokenBalances(address: string | undefined)`
- Retrieves token balances for a specific address on the Cardano blockchain.
- Parameters: 
  - `address` (string, optional): The address for which to retrieve token balances.
- Returns: Promise resolving to an array of `OriginAmount` objects

#### `algorand_origin_getTokenBalances(address: string | undefined)`
- Retrieves token balances for a specific address on the Algorand blockchain.
- Parameters: 
  - `address` (string, optional): The address for which to retrieve token balances.
- Returns: Promise resolving to an array of `OriginAmount` objects

#### `algo_updateAssetsWithBridgeInfo(tokens: OriginAmount[])`
- Updates Algorand token asset information.
- Parameters: 
  - `tokens` (Array of `OriginAmount` objects): The tokens to update.
- Returns: Promise resolving to an array of updated `OriginAmount` objects

#### `ada_updateAssetsWithBridgeInfo(tokens: OriginAmount[])`
- Updates Cardano token asset information.
- Parameters: 
  - `tokens` (Array of `OriginAmount` objects): The tokens to update.
- Returns: Promise resolving to an array of updated `OriginAmount` objects

#### `areTokensAllowed(assetIds: string[])`
- Checks if specific tokens are allowed.
- Parameters: 
  - `assetIds` (Array of strings): The asset IDs to check.
- Returns: Promise resolving to an object mapping asset IDs to booleans

#### `constructAllowedTokensMap(normalizedAssetIds: string[], isAssetAllowed: (asset: any) => boolean)`
- Constructs a map indicating which assets are allowed.
- Parameters: 
  - `normalizedAssetIds` (Array of strings): The asset IDs to map.
  - `isAssetAllowed` (Function): Callback to determine if an asset is allowed.
- Returns: Object mapping asset IDs to booleans

#### `cardano_areTokensAllowed(assetIds: string[])`
- Checks if specific Cardano tokens are allowed.
- Parameters: 
  - `assetIds` (Array of strings): The asset IDs to check.
- Returns: Promise resolving to an object mapping asset IDs to booleans

#### `algorand_areTokensAllowed(assetIds: string[])`
- Checks if specific Algorand tokens are allowed.
- Parameters: 
  - `assetIds` (Array of strings): The asset IDs to check.
- Returns: Promise resolving to an object mapping asset IDs to booleans

#### `wrap(destination: string | undefined, assetId: string, amount: number)`
- Wraps tokens.
- Parameters: 
  - `destination` (string, optional): The destination for the tokens.
  - `assetId` (string): The ID of the asset to wrap.
  - `amount` (number): The amount of the asset to wrap.
- Returns: Promise resolving to void

#### `unwrap(destination: string | undefined, assetId: string, amount: BigNumber)`
- Unwraps tokens.
- Parameters: 
  - `destination` (string, optional): The destination for the tokens.
  - `assetId` (string): The ID of the asset to unwrap.
  - `amount` (BigNumber): The amount of the asset to unwrap.
- Returns: Promise resolving to void

#### `latestActivity()`
- Retrieves recent activity on the blockchain.
- Parameters: None
- Returns: Promise resolving to an array of `Activity` objects

#### `getL2TransactionList(address: string | undefined, page = 0, offset = 10)`
- Retrieves a list of Layer 2 transactions for a specific address.
- Parameters: 
  - `address` (string, optional): The address for which to retrieve transactions.
  - `page` (number, default is 0): The page number for pagination.
  - `offset` (number, default is 10): The offset number for pagination.
- Returns: Promise resolving to an array of `L2Transaction` objects

## Further Documentation

In-depth method descriptions, usage examples, and return types can be found in the library's codebase. If further information is required, please reach out to us. We're dedicated to making WSCLib a robust and easy-to-use solution for developers working with WSCs.

## Contribute

WSCLib is open for contributions. We encourage you to contribute to WSCLib and help us improve this library.

## License

WSCLib is MIT licensed.

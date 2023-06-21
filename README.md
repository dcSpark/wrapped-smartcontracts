# Milkomeda Wrapped Smart Contracts

## Table of Contents

- [Overview](#overview)
- [For developers](#for-developers)
- [Smart contracts](#smart-contracts)
  - [Actor](#actor)
  - [ActorFactory](#actorfactory)
  - [L1MsgVerify](#l1msgverify)
    - [CardanoSigVerification](#cardanosigverification)
- [Oracle](#oracle)
- [Provider](#provider)
- [Flow](#flow)
- [Setup](#setup)
- [Tests](#tests)
- [Example dapp](#example-dapp)

## Overview

Wrapped Smart Contracts (WSC) are a new concept aimed at facilitating interaction with smart contracts on sidechains or Layer 2 (L2) solutions without the need for users to directly migrate to these new ecosystems.

The Layer 1 (L1) blockchain acts as a robust coordination layer, allowing users to execute smart contracts on sidechains or L2 while remaining on the L1 blockchain. This provides a user-friendly experience, as users can interact with various systems without changing wallets or needing a deep understanding of the underlying processes.

### How it works (simplified)

Every single step requires user interaction in the form of a transaction.

- User Action: The user initiates an action on a dApp while on the main blockchain. This request is translated into specific parameters for a proxy smart contract.
- Proxy Deployment and Execution: A proxy smart contract, reflecting the user's intent, is deployed on the sidechain. The proxy contract then interacts with the appropriate smart contract on the sidechain to execute the desired action.
- Result Processing: The outcome from the sidechain smart contract execution is relayed back to the user on the main blockchain. The user's state is updated, and they see the results of their action on the dApp, all while staying on the main blockchain.

## For developers

If you are interested in developing dapps on the milkomeda layer 2, see the [developers documentation](./docs/developers.md). Also, there is a library under `packages/milkomeda-wsc` that help the development of DApp using WSC. It's also available in [npm](https://www.npmjs.com/package/milkomeda-wsc).

## Smart contracts

The role of the Metamask wallet on the milkomeda is for the user to have dedicated account. To get around this the smart contract `Actor` will be used as an account abstraction that will be acting on behalf of the user.

### Actor

Actor is a smart contract deployed on the milkomeda layer 2 that is bound to the specific l1 address. It serves as an account abstraction, it has a balance, a nonce, and can execute signed transactions on behalf of the user. To verify the signature the actor will use the `L1MsgVerify` precompiled contract that can verify l1 signatures. The execution will be invoked by oracle service, which will get exact refund for the gas paid during the execution.

In the [compile task](./packages/contracts/tasks/compile.ts) the `Actor` contract is compiled to the yul code and prepended with the code to store the transaction gas limit to the storage. The gas limit is crucial to the calculation of used gas and to verify that the oracle acted honestly and didn't provide less gas than user signed and therefore the transaction would run out of gas. The yul code is later compiled to the evm bytecode and edited in the artifacts.

### ActorFactory

ActorFactory is a smart contract deployed on the milkomeda layer 2 that is used to deploy actors. It uses CREATE2 opcode to deterministically derive Actor address from the l1 address.

### L1MsgVerify

L1MsgVerify is a precompiled contract that is used to verify the signature of the message signed on the layer 1 mainchain.

#### CardanoSigVerification

CardanoSigVerification is a precompiled contract that is deprecated, but needed for backwards compatibility with the milkomeda-c1 testnet.

## Oracle

Oracle is a node.js JSON-RPC api that relays messages from l1 to the l2 actors. It provides methods for interacting with the ActorFactory and to execute transactions on behalf of the user.

## Provider

Provider is a front end library which injects the provider based on EIP-1193 object to the `window.ethereum` object. Provider customizes certain methods like `eth_sendTransaction` or `eth_requestAccounts` by invoking l1 wallet and transforming the result.

## Flow

The exemplary flow of the protocol is as follows:

1. The dapp injects the provider.
2. The dapp calls `eth_requestAccounts` to get the user's l2 address.
3. The provider calls `eth_sendTransaction` to execute any transaction.
4. The transactions gets to the oracle from provider.
5. The oracle prevalidates the transaction and executes it on the actor.
6. The oracle gets refund for the paid gas.
7. Any uncustomized methods the provider passes to the regular provider node.

## Setup

You need to have installed `node` and `npm`.

To install dependencies run:

```bash
npm run prepare-artifacts
npm install
```

## Tests

To run tests you need to have installed [dcSpark/besu](https://github.com/dcSpark/besu) or docker.

Run the testing network:

```bash
npm run chain:start
```

To stop the testing network:

```bash
npm run chain:stop
```

To run tests:

```bash
npm test
```

## Example dapp

To run the example dapp you need to have running chain and oracle.

To run the chain and oracle:

```bash
npm run chain:start
npm run oracle:dev
```

To run the dapp:

```bash
npm start -w packages/dapp-example
```

Dapp is running on [localhost:3000](http://localhost:3000).

Licensing

The primary license for Wrapped Smart-Contracts is the Starting Gate Public License 1.0 (SGPL-1.0), see [LICENSE](./LICENSE). However, some packages are licensed under a MIT License: `actor-webpage`, `milkomeda-wsc` and `dapp-example`.

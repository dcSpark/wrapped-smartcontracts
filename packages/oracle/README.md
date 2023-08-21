# Oracle

Backend JSON-RPC service for interaction with Actor and ActorFactory smart contracts. Used to relay messages from provider to the blockchain.

## Install

```bash
npm install
```

## Run dev

```bash
npm run dev
```

## Build & Run production

```bash
npm run build
npm start
```

## Create .env file

```bash
cp .example.env .env
```

## Config

To set the config either export environment variables or edit the `.env` file.

```bash
# account that will be signing transactions to the actor and actor factory
# it needs to have some funds in native asset to pay for the gas
SIGNER_PRIVATE_KEY=

# node environment
NODE_ENV=development

# port on which the server will be running
PORT=8080

# address of the deployed actor factory
ACTOR_FACTORY_ADDRESS=0xE1FaA7777E8d76Cf2F7fd26eD93790d58c644b82

# url of the corresponding chain provider
JSON_RPC_PROVIDER_URL=https://rpc-devnet-cardano-evm.c1.milkomeda.com
```

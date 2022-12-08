# Milkomeda Wrapped Smart Contracts

[Shortcut Epic](https://app.shortcut.com/dcspark/epic/7930)

[Proposal](https://docs.google.com/document/d/1tbhMmctw6RQKW_UUox0qOnqhOfBe7uHRO0sMx7Isaac)

To show old codebase see [legacy tag](https://github.com/dcSpark/wrapped-smartcontracts/tree/legacy).

## Setup

You need to have installed `node` and `npm`.

To install dependencies run:

```bash
npm run prepare-artifacts
npm install
```

To create `.env` file run:

```bash
npm run create-env
```

## Tests

To run tests you need to have installed [dcSpark/besu](https://github.com/dcSpark/besu), or pull the docker image.

```bash
docker pull dcspark/besu:22.10.0-milkomeda-c1
```

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

To run the example dapp you need to have running chain, oracle and deployed actor (and example `Counter` contract).

To deploy actor:

```bash
cd packages/contracts && npm run deploy:actor \
--actor-factory 0x0000000000000000000000000000000000111111 \
--cardano-address <bech32-cardano-address>
```

To deploy Counter:

```bash
cd packages/contracts && npm run deploy:counter
```

To run the chain and oracle:

```bash
npm run chain:start
npm run oracle:start
```

To run the dapp:

```bash
npm start -w packages/dapp-example
```

Dapp is running on [localhost:8080](http://localhost:8080).

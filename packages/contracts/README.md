# Contracts

## Requirements
You need to have installed `solc` with version `0.8.0` or higher. If you don't have it, you can install it with following the instructions for `solc-select` [here](https://github.com/crytic/solc-select) (similar to nvm for Node.js).

## Compiling

```bash
npm run prepare-compile
npm run compile
```

## Testing

```bash
npm run test
```

## Factory deploy

```bash
PRIVATE_KEY=... npx hardhat actor-factory:deploy --network a1-dev --l1-type Algorand
```

# Upbond DID

This project uses the ERC725Y standard from the [ERC725 Alliance](https://erc725alliance.org/).

### 1. Install project
```shell
yarn install
```

### 2. Compile
```shell
yarn compile
```

### 3. Run test unit
- without gas report :
```shell
yarn test
```
- with gas report :
```shell
yarn test:gas
```

### 4. Run local test node
```shell
yarn compile
```

### 5. Deploy
- local (run step 4 before at other terminal) :
```shell
yarn deploy:local
```
- testnet :
```shell
yarn deploy:testnet
```
- mainnet :
```shell
yarn deploy:mainnet
```

Note : before run some command, please set `.env` first
# ERC-20-Token-Discoperi-smart-contract

## Secrets

1. After clone this repo and before use the truffle please create the file `secrets.json` in the code root with two fields `mnemonic` and `infuraApiKey` in it, example:
```
{
  "mnemonic": "lounge sting unhappy dwarf melody ocean review permit coconut maze grab leopard",
  "infuraApiKey": "O1LEERP0UrL6fjxHRpSr"
}
```

## Building
```
npm install
```
## Testing
### Run tests:

- start the ganache-cli 
```
npm run ganache
```
- start test (in separate terminal window)
```
npm run test
```

### Run test coverage:

- start coverage
```
npm run coverage
```
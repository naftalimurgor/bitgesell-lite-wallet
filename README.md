# Bitgesell Lite Wallet
<img src="Icon.png" style="height: 60px;"/>

A light weight Bitgesell Wallet. For a comprehensive and full fledged, please visit [Official Wallet](https://app.bglwallet.io/)
## Installation

```bash
npm install bitgesell-litewallet
```

## Usage

### 1. Setup

Ensure you have a `.env` file with your seed phrase:

```
SEED_PHRASE="your seed phrase here"
```

### 2. Create a New Wallet

```typescript
import { Wallet } from 'bitgesell-litewallet'
import * as dotenv from 'dotenv'

dotenv.config()

const wallet = new Wallet({
  from: {
    index: 0,
    seedPhrase: process.env.SEED_PHRASE
  }
})

const liteWallet = await wallet.createWallet()

console.log(liteWallet)
```

### 3. Get Account Address

```typescript
const address = await wallet.getAddress()

console.log(address)
```

### 4. Get Account Balance

```typescript
const balance = await wallet.getBalance()

console.log(balance)
```

### 5. Send BGL to a Recipient

```typescript
const transaction = {
  value: 1, // 1 BGL
  to: 'bgl1qh3tsz3a7l3m49xaq4xcdx8aefthchuqagmspcn'
}

const txReceipt = await wallet.sendTransaction(transaction)

console.log(txReceipt)
```

### 6. Get Account Transaction History

```typescript
const txHistory = await wallet.getAccountTransactionHistory()

console.log(txHistory)
```

### 7. Sign a Transaction

```typescript
const transaction = {
  value: 0.1,
  to: 'bgl1qh3tsz3a7l3m49xaq4xcdx8aefthchuqagmspcn'
}

const txHex = await wallet.signTransaction(transaction)

console.log(txHex)
```

## Running Tests

To run the test suite:

```bash
npm test
```

## License

MIT
```
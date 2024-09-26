# Bitgesell WBGLBridge SDK
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

// Create a new wallet
const liteWallet = await wallet.createWallet()

console.log(liteWallet)  // Returns the private key and address
```

### 3. Get Account Address

```typescript
// Get the account address
const address = await wallet.getAddress()

console.log(address)  // Returns the wallet address
```

### 4. Get Account Balance

```typescript
// Get the account balance
const balance = await wallet.getBalance()

console.log(balance)  // Returns the balance of the wallet in BGL
```

### 5. Send BGL to a Recipient

```typescript
// Send BGL to another address
const transaction = {
  value: 1, // 1 BGL
  to: 'bgl1qh3tsz3a7l3m49xaq4xcdx8aefthchuqagmspcn'
}

const txReceipt = await wallet.sendTransaction(transaction)

console.log(txReceipt)  // Returns transaction details like txHash and balance
```

### 6. Get Account Transaction History

```typescript
// Get transaction history of the account
const txHistory = await wallet.getAccountTransactionHistory()

console.log(txHistory)  // Returns the list of past transactions
```

### 7. Sign a Transaction

```typescript
// Sign a transaction and get the serialized HEX format
const transaction = {
  value: 0.1,
  to: 'bgl1qh3tsz3a7l3m49xaq4xcdx8aefthchuqagmspcn'
}

const txHex = await wallet.signTransaction(transaction)

console.log(txHex)  // Returns the signed transaction in HEX format
```

## Running Tests

To run the test suite:

```bash
npm test
```

### Contributions to Test Coverage

We welcome contributions that improve the test coverage for `bitgesell-litewallet`. If you have new test cases or enhancements for the existing test suite, feel free to submit a pull request. Our current tests validate wallet creation, balance retrieval, transaction signing, and sending BGL, but additional test cases can further strengthen the reliability of the package.

Contributors are encouraged to:

- Add more comprehensive test cases.
- Identify edge cases.
- Help with testing under different environments or scenarios.

Let’s work together to make `bitgesell-litewallet` even more robust!

## License

MIT
```
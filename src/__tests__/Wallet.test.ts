import * as matchers from 'jest-extended'
import * as dotenv from 'dotenv'
import { Wallet } from '../Wallet'

expect.extend(matchers)
dotenv.config()
const TIME_OUT_MS = 10 * 1000

jest.setTimeout(TIME_OUT_MS)

describe('Wallet Methods', () => {
  const options = {
    from: {
      index: 0,
      seedPhrase: process.env.SEED_PHRASE as string
    }
  }

  const wallet = new Wallet(options)
  it.only('#creates new Wallet', async () => {
    try {
      const liteWallet = await wallet.createWallet()
      expect(liteWallet).toHaveProperty('privateKey')
      expect(liteWallet).toHaveProperty('address')
    } catch (error) {
      console.log(error)
    }
  })

  it('#gets account address', async () => {

    try {
      const address = await wallet.getAddress()
      console.log(address)
      expect(address).toBeDefined()
    } catch (error) {
      console.error(error)
    }
  })

  it('#gets account Balance', async () => {
    try {
      const balance = await wallet.getBalance()
      expect(balance).toBeDefined()

    } catch (error) {
      console.log(error)
    }
  })

  it.only('#sends BGL to a recepient BGL address', async () => {
    const transaction = {
      value: 1, // 1BGL
      to: 'bgl1qh3tsz3a7l3m49xaq4xcdx8aefthchuqagmspcn'
    }

    try {
      const txReceipt = await wallet.sendTransaction(transaction)
      console.log(txReceipt)
      expect(txReceipt.balance).toBeDefined()
      expect(txReceipt.success).toBeTrue()
      expect(txReceipt.txHash).toBeDefined()
    } catch (error) {
      console.error(error)
    }
  })

  it.only('gets account transaction history', async () => {
    try {
      const txHistory = await wallet.getAccountTransactionHistory()
      expect(txHistory).toBeDefined()
    } catch (error) {
      console.error(error)
    }
  })

  it('#signs a  transaction returning the HEX serialized format', async () => {
    const transaction = {
      value: 0.1,
      to: 'bgl1qh3tsz3a7l3m49xaq4xcdx8aefthchuqagmspcn'
    }

    try {
      const txHex = await wallet.signTransaction(transaction)
      expect(txHex).toBeDefined()
    } catch (error) {
      console.error(error)
    }
  })

})

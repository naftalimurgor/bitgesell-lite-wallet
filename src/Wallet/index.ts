import jsbgl from '@naftalimurgor/jsbgl'
import axios from 'axios'
// @ts-ignore
import { Transaction } from '../Transaction'
import { toBGL, toSatoshiUnits } from 'bgl-units'
/**
 * @param {privateKey} key to derive account from
 * @param {from} an object to derive account from a seedphrase
 * @param {rpc} available to interract with Bitgesell blockchain network
 */

export interface IOptions {
  privateKey?: string
  from?: {
    seedPhrase: string,
    index: number
  },
  rpc?: string
}

/**
 * @param {fee} fee to pay for the transaction
 * @param {value} amount of BGL to send to receipient address
 * @param {to} the recepient address
 * @param {from} the sender address, optional
 */
export interface ITransaction {
  fee?: number,
  value: number,
  from?: string
  to: string
}

/**
 * @param {privateKey} account privateKey
 * @param {address} account address
 */
export interface IWalletProperties {
  privateKey: string
  address: string
}

/**
 * Transaction Receipt
 */
interface ITransactionRecipt {
  result: string,
  error: null,
  id: 'string'
}


interface TxInfo {
  data: Data;
  time: number;
}

interface Data {
  page: number;
  limit: number;
  pages: number;
  list: List[];
}

interface List {
  regtest: boolean;
  segwit: boolean;
  rbf: boolean;
  txId: string;
  version: number;
  size: number;
  vSize: number;
  bSize: number;
  lockTime: number;
  confirmations: number;
  blockTime: number;
  blockIndex: number;
  coinbase: boolean;
  fee: number;
  data?: any;
  amount: number;
  weight: number;
  blockHeight: number;
  timestamp: number;
  inputsAmount: number;
  inputAddressCount: number;
  outAddressCount: number;
  inputsCount: number;
  outsCount: number;
  outputsAmount: number;
  addressReceived: number;
  addressOuts: number;
  addressSent: number;
  addressInputs: number;
}

interface TransactionHistoryItem {
  id: number
  tx_id: string
  timestamp: number
  amount: number
  confirmations: number | string
  block_height: number | string
  rbf: boolean
  coinbase: boolean
  fee: number
}


export class Wallet {
  private readonly privateKeyOrSeed: string
  private readonly index: number
  private readonly rpc: string
  private defaultRPC = 'https://rpc.bglwallet.io'

  constructor(options: IOptions) {

    if (options.hasOwnProperty('privateKey')) {
      this.privateKeyOrSeed = options.privateKey
    }

    if (options.hasOwnProperty('from')) {
      this.privateKeyOrSeed = options.from.seedPhrase
      this.index = options.from.index || 0
    }

    this.rpc = options.rpc || this.defaultRPC
  }

  /**
   * getAddress returns the current wallet address
   */
  public async getAddress(): Promise<string> {
    const wallet = await this.createWallet()
    return wallet.address
  }

  /**
   * getBalance returns the current BGL balance of the wallet
   */
  public async getBalance() {
    const bglAPIV1Endpoint = 'https://api.bitaps.com/bgl/v1/blockchain'
    try {
      const address = await this.getAddress()
      const response = await axios.get(`${bglAPIV1Endpoint}/address/state/${address}`)
      // @ts-ignore
      return response.data.data.balance
    } catch (error) {
      throw new Error(`${error}`)
    }
  }

  /**
   * getAccountUTXO returns the current unspent transaction ouputs for the account.
   */
  public async getAccountUTXO() {

    try {

      const address = await this.getAddress()
      const bglAPIV1Endpoint = 'https://api.bitaps.com/bgl/v1/blockchain'
      const bglAddressUTXOEndpoint = `${bglAPIV1Endpoint}/address/utxo/${address}`

      const res = await axios.get(bglAddressUTXOEndpoint)
      // @ts-ignore
      return res.data.data
    } catch (error) {
    }

  }


  /**
   * createWallet imports a wallet from privateKey or Mnemonic
   */
  // @ts-ignore
  public async createWallet(): Promise<IWalletProperties> {

    let wallet: IWalletProperties

    await jsbgl.asyncInit(globalThis)

    if (globalThis.isMnemonicCheckSumValid(this.privateKeyOrSeed)) {
      wallet = await this._importWalletFromMnemonic() as IWalletProperties
      return wallet
    } else if (globalThis.isWifValid(this.privateKeyOrSeed)) {
      wallet = await this._importWalletFromPrivateKey()
      return wallet
    }
  }


  /**
   * sendTransaction signs and broadcasts a raw transaction to the Bitgesesll blockchain network
   */
  public async sendTransaction(transaction: ITransaction) {
    const _txFee = transaction.fee || Transaction.DEFAULT_BGL_FEE
    const txFee = toSatoshiUnits(_txFee)
    try {
      const { privateKey, address } = await this.createWallet()
      const { txObject, balance } = await this._buildTransactionObject({
        fee: txFee,
        value: transaction.value,
        from: address,
        to: transaction.to
      }, privateKey)


      const txResult = await this._broadcastbglTransaction(txObject) as ITransactionRecipt

      return {
        txHash: txResult.result,
        rpc_result: txResult,
        success: txResult.error === null ? true : false,
        balance: balance,
      }
    } catch (error) {
      return { error: `${error}`, success: false }
    }
  }


  /**
   * signTransaction signs a transaction and returns the hex format
   */
  public async signTransaction(transaction: ITransaction) {
    const _txFee = transaction.fee || Transaction.DEFAULT_BGL_FEE
    const txFee = toSatoshiUnits(_txFee)

    try {
      const { privateKey, address } = await this.createWallet()

      const { txObject } = await this._buildTransactionObject({
        fee: txFee,
        value: transaction.value,
        from: address,
        to: transaction.to
      }, privateKey)

      return txObject
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * getAccountHistory returns the account transaction history
   */

  public async getAccountTransactionHistory() {

    const { address } = await this.createWallet()

    try {
      const txData: Array<TransactionHistoryItem> = []
      const result = await fetch(`https://api.bitaps.com/bgl/v1/blockchain/address/transactions/${address}`)
      const txInfor = await result.json() as TxInfo
      let count = 0

      for (const key in txInfor.data.list) {
        const value = txInfor.data.list[key]
        count++

        txData.push({
          id: count,
          // to?
          // from?
          tx_id: value.txId,
          timestamp: value.timestamp,
          amount: toBGL(value.amount),
          // amountUSD: await _convertToUsd(value.amount),
          confirmations: value.confirmations ? value.confirmations : 'pending',
          block_height: value.blockHeight ? value.blockHeight : 'pending',
          rbf: value.rbf,
          coinbase: value.coinbase,
          fee: toBGL(value.fee),
        })
      }
      return { txHistory: txData }
    } catch (error) {
      return { error: `${error}` }
    }
  }

  /**
  * createWallet imports a wallet from privateKey or Mnemonic
  */

  /// BEGIN PRIVATE METHODS
  private _importWalletFromPrivateKey = async () => {
    try {
      await jsbgl.asyncInit(globalThis)
      const wif = await this._privateKeyToWIF(this.privateKeyOrSeed)
      const privateKeyInstance = new globalThis.PrivateKey(wif)
      const wallet = new globalThis.Address(privateKeyInstance)
      return {
        address: wallet.address,
        wallet: wallet,
        privateKey: wallet.privateKey
      }
    } catch (error) {
      throw new Error(`Failed: ${error}`)
    }
  }

  private _privateKeyToWIF = async (privatekey: string) => {
    try {
      await jsbgl.asyncInit(globalThis)
      const privateKey = new globalThis.PrivateKey(privatekey)
      return privateKey.wif
    } catch (error) {
      throw new Error(`Failed: ${error}`)
    }
  }
  /// end Public methods

  /// Begin Private Methods
  /**
   * @private
   * importWalletFromPrivateKey imports wallet from Bitgesell Mainnet privateKey
   */


  /**
   * @private
   * importWalletFromMnemonic imports from Bitgesell Mainnet seedphrase
   * @param indexAddress the address to use, defaults to address 0, the index address
   */
  private async _importWalletFromMnemonic() {
    try {
      await jsbgl.asyncInit(globalThis)

      const wallet = new globalThis.Wallet({ from: this.privateKeyOrSeed })
      const address = wallet.getAddress(this.index) // index address
      return {
        address: address.address,
        wallet,
        privateKey: address.privateKey
      }

    } catch (error) {
      throw new Error(`${error}`)
    }
  }

  /// build a txObject
  public async _buildTransactionObject({
    from,
    to,
    fee,
    value,
  }: ITransaction, privateKey: string) {
    await jsbgl.asyncInit(globalThis)
    // @ts-ignore
    const txObject = Transaction.makeTxObject()

    const utxosData = await this._fetchAddressUTxos(from)
    if (!utxosData) throw new Error(`Failed to fetch utxo output for ${from}`)
    // @ts-ignore
    const { data: utxos } = utxosData
    const data = await this._getBglAddressBalance(from)
    const balance = data.balance
    // already converted to Sats

    let newBalance = (balance - toSatoshiUnits(value)) - fee
    if (utxos.length) {
      for (const key in utxos) {
        const utxo = utxos[key]
        txObject.addInput({
          txId: utxo.txId,
          vOut: utxo.vOut,
          address: from,
        })
      }

      txObject.addOutput({
        value: value,
        address: to
      })

      if (newBalance > 0) {

        txObject.addOutput({
          value: newBalance,
          address: from
        })
      }

      let utxoCount = 0
      for (const key in utxos) {
        const utxo = utxos[key]
        txObject.signInput(utxoCount, {
          privateKey: privateKey,
          value: utxo.amount
        })

        utxoCount++
      }

      const newTx = txObject.serialize()
      return { txObject: newTx, balance: newBalance }
    }
    return { error: 'error: No unspent utxos found' }
  }


  public async _broadcastbglTransaction(txObject: Record<string, string>) {
    const url = new URL(this.rpc)
    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: `{"jsonrpc":"1.0","id":"curltext","method":"sendrawtransaction","params":["${txObject}"]}`,
    }

    try {

      const res = await fetch(url.origin, {
        headers: payload.headers,
        method: 'POST',
        body: payload.body
      })

      return res.json()

    } catch (error) {
      return { error: `${error}` }
    }
  }


  public async _getBglAddressBalance(bglAddress: string) {
    const bglAPIV1Endpoint = 'https://api.bitaps.com/bgl/v1/blockchain'
    try {
      const response = await axios.get(`${bglAPIV1Endpoint}/address/state/${bglAddress}`)
      // @ts-ignore
      return response.data.data
    } catch (error) {
      // @ts-ignore
      console.error(error)
    }
  }

  public async _fetchAddressUTxos(bglAddress: string) {
    const bglAPIV1Endpoint = 'https://api.bitaps.com/bgl/v1/blockchain'
    const bglAddressUTXOEndpoint = `${bglAPIV1Endpoint}/address/utxo/${bglAddress}`

    try {
      const res = await axios.get(bglAddressUTXOEndpoint)
      return res.data
    } catch (error) {
      // @ts-ignore
      console.error(error)
      return
    }
  }
  /// End Private Methods
}
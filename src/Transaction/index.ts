// @ts-nocheck
import jsbgl from '@naftalimurgor/jsbgl'

/**
 * Singleton class for creating a transaction object.
 */
export class Transaction {
  public static DEFAULT_BGL_FEE = 0.0001 // default fee of 10,000 satoshis
  private static txInstance: Transaction
  private constructor() {
    this._initJsbglModule()
  }

  public static makeTxObject() {
    if (!this.txInstance) {
      this.txInstance = new Transaction()
      return new globalThis.Transaction()
    }
  }

  /**
   * 
   * Initializes the jsbgl module, by injecting the module to the global scope
  */
  private _initJsbglModule() {
    return Promise.resolve(jsbgl.asyncInit())
  }
}
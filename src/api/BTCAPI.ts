import { verifyParams } from '../helper'
import ChainBaseAPI from './ChainBaseAPI'

export class BTCAPI extends ChainBaseAPI {
  protected _namespace = 'btc'

  sign (params: { rawTransaction: string; unspents: string }): Promise<void> {
    return this._request({
      method: 'sign',
      params
    })
  }

  sendTransaction (params: { rawTransaction: string; unspents: string }): Promise<void> {
    return this._request({
      method: 'sign',
      params
    })
  }
}

export default BTCAPI

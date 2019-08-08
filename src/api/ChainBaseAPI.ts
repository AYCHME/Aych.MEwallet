import { verifyParams } from '../helper'
import BaseAPI from './BaseAPI'

export class ChainBaseAPI extends BaseAPI {
  // showTransactionDetail (params: { chainType: string; trxId: string }) {
  //   verifyParams(params, ['chainType', 'trxId'])

  //   return this._request({
  //     method: 'showTransactionDetail',
  //     params
  //   }, true)
  // }

  getAddressFromAddressBook () {
    return this._request({
      method: 'getAddressFromAddressBook',
      params: {}
    })
  }

  getAddressFromCard () {
    return this._request({
      method: 'getAddressFromCard',
      params: {}
    })
  }
}

export default ChainBaseAPI

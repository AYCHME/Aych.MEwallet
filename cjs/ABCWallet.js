"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uniqueId_1 = require("lodash-es/uniqueId");
const eventemitter3_1 = require("eventemitter3");
const helper_1 = require("./helper");
const api_1 = require("./api");
const NativeChannel_1 = require("./channel/NativeChannel");
const IframeChannel_1 = require("./channel/IframeChannel");
class ABCWallet extends eventemitter3_1.default {
    constructor(logger) {
        super();
        this._promises = new Map();
        window.ABCWallet = this;
        this.log = logger;
        if (window.self !== window.top) {
            this._channel = new IframeChannel_1.default();
        }
        else {
            this._channel = new NativeChannel_1.default('ABCWalletBridge', logger);
        }
        for (const key of Object.keys(api_1.default)) {
            this[key] = new api_1.default[key](this);
        }
        this._timer = setInterval(() => {
            const now = (new Date()).getTime();
            for (const [, promise] of this._promises) {
                const duration = now - promise.createdAt.getTime();
                if (duration > 3600 * 1000) {
                    this.log.warn('ABCWallet.response take too long(more than 5000ms):', promise.path);
                }
            }
        }, 1000);
    }
    request(payload, isNotify = false) {
        return new Promise((resolve, reject) => {
            payload = Object.assign(payload, { id: isNotify ? '' : uniqueId_1.default('abcwallet-'), jsonrpc: '2.0' });
            // 如果不是通知，将 promise 的方法和回调都保存起来，等待响应
            if (!isNotify) {
                this.log.debug('ABCWallet.request add promise: ', payload.id);
                this._promises.set(payload.id, {
                    resolve,
                    reject,
                    path: `${payload.namespace}:${payload.method}`,
                    createdAt: new Date()
                });
            }
            this.log.debug('ABCWallet.request will send message:', payload);
            this._channel.postMessage(payload);
        });
    }
    response(msg) {
        msg = JSON.parse(msg);
        this.log.debug('ABCWallet.response received message:', msg);
        if (helper_1.isRequest(msg)) {
            this.log.debug('ABCWallet.response trigger notify:', msg.id);
            this.emit(`notify:${msg.method}`, msg.params);
        }
        else {
            // provider 中对应的 promise 取出并 resolve
            const promise = this._promises.get(msg.id);
            if (!promise) {
                this.log.error(`ABCWallet.response can not find promise[${msg.id}]:`, promise.path);
            }
            const duration = (new Date()).getTime() - promise.createdAt.getTime();
            if (duration > 5000) {
                this.log.warn('ABCWallet.response take too long(more than 5000ms):', promise.path);
            }
            // 删除已处理的 promise
            this._promises.delete(msg.id);
            this.log.debug('ABCWallet.response find and delete promise:', msg.id);
            if (msg.error) {
                this.log.error('ABCWallet.response error:', msg.error);
                promise.reject.call(this, msg.error);
            }
            else {
                this.log.error('ABCWallet.response result:', msg.result);
                promise.resolve.call(this, msg.result);
            }
        }
    }
}
exports.ABCWallet = ABCWallet;
exports.default = ABCWallet;

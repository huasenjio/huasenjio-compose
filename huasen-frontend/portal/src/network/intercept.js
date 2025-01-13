/*
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-12-03 21:11:09
 * @Description: 统一配置请求拦截器
 */

import Vue from 'vue';
import state from '@/store/state/state.js';
import storage from '@/plugin/storage.js';
import constant from '@/constant/index.js';
import { decrypt, encrypt, getAESSecret, rsaEncryptLong, rsaDecryptLong } from 'huasen-lib';

/**
 * 获取请求头字段
 * @param {Object} headers - 请求头
 * @param {String} key - 字段名
 * @returns 
 */
const getHeadersValue = (headers, key) => {
  return headers[key] || headers[key.toLowerCase()]
}

const that = Vue.prototype;
let rsaPublicSecret = null;
let aesSecret = storage.getItem(constant.localAESSecret)
if (!aesSecret) {
  aesSecret = getAESSecret()
  storage.setItem(constant.localAESSecret, aesSecret);
}

function requestIntercept(config) {
  // 开启遮罩
  if (config._loading) that.$startLoading();
  // 用户埋点
  config.headers.Dot = 'user';
  config.headers.Token = state.user.token || '***·***·***';
  // rsa加密传输对称密钥
  if (aesSecret && rsaPublicSecret) {
    config.headers['Secret-Key'] = rsaEncryptLong('public', rsaPublicSecret, JSON.stringify(aesSecret), 64)
  }
  // 加密传输参数
  if (config.method === 'post' && config.data && ['rsa', 'aesinrsa'].includes(config._secret)) {
    try {
      // 根据传入加密类型，按约定拼凑参数
      let secretText;
      let secretMethod = config._secret
      config.headers['Secret-Method'] = secretMethod
      let realData = config.data;
      if (secretMethod === 'rsa' && rsaPublicSecret) {
        // 小量数据传输
        secretText = rsaEncryptLong('public', rsaPublicSecret, JSON.stringify(realData), 64)
      } else if (secretMethod === 'aesinrsa' && rsaPublicSecret) {
        // 推荐使用，支持大量传输数据。对称加密数据，非对称加密aes密钥
        secretText = encrypt(JSON.stringify(realData), aesSecret)
      }
      config.data = secretText ? { _secret_text: secretText } : realData
    } catch (error) {
      console.warn('加密失败：', error);
    }
  }
  // 放行参数
  return config;
}

function requestError(error) {
  // 发生错误时关闭重置遮罩
  that.$resetLoading();
  // 请求无法发出时的错误
  return Promise.reject(error);
}

function responseIntercept(result) {
  let { headers, config, status, data } = result;
  // 关闭遮罩
  if (config._loading) that.$resetLoading();
  // 保存非对称公钥
  let rsaScrect = getHeadersValue(headers, 'Rsa-Public-Secret');
  if (rsaScrect) {
    rsaPublicSecret = Buffer.from(rsaScrect, 'base64').toString();
  }
  // 判断响应头类型，如果数据为二进制流，直接放行
  if (headers['content-type'] === 'application/octet-stream') {
    return result;
  }
  // 解密数据
  let secretMethod = getHeadersValue(headers, 'Secret-Method');
  if (secretMethod) {
    try {
      let realRawData
      switch (secretMethod) {
        case 'aes':
          // 本地对称密钥解析数据
          realRawData = decrypt(data.data, aesSecret);
          break;
        case 'rsa':
          realRawData = rsaDecryptLong('public', rsaPublicSecret, data.data, 64);
          break;
      }
      data.data = realRawData ? JSON.parse(realRawData) : data.data
    } catch (error) {
      localStorage.removeItem(constant.localAESSecret)
      console.warn('解密失败：', error);
    }
  }
  // 针对mock请求，处理返回参数格式
  if (config._isMock) {
    console.group();
    console.warn('mockUrl：', config.url);
    console.warn('mockData：', data);
    console.groupEnd();
  }
  // 正常的逻辑提示处理
  if (status === 200) {
    // 提示请求成功
    if (config._notify) that.$tips('success', data.msg, 'top-right', 1200);
    // 返回数据进入then
    return data;
  } else if (status === 204) {
    // 请求受理但是无返回
    if (config._errorNotify) that.$tips('warning', data.msg, 'top-right', 1200);
  }
  return Promise.reject(result);
}

function responseError(error) {
  console.error("请求发生异常：", error)

  // 发生错误时关闭重置遮罩
  that.$resetLoading();
  let { config, response } = typeof error === 'object' ? error : {};
  if (!navigator.onLine) {
    // 无网络情况
    that.$tips('error', '请检查网络是否连接', 'top-right', 2000);
  } else if (response.status == 400) {
    // 请求异常
    if (config._errorNotify) that.$tips('error', response.data.msg, 'top-right', 2000);
  } else if (response.status == 401) {
    // 请求未认证，需要登录
    if (config._errorNotify) that.$tips('warning', response.data.msg, 'top-right', 2000);
  } else if (response.status == 403) {
    // 请求禁止，权限不够
    if (config._errorNotify) that.$tips('error', response.data.msg, 'top-right', 2000);
  } else {
    that.$tips('error', '服务异常，稍后重试！', 'top-right', 2000);
  }
  return Promise.reject(error);
}

export default {
  requestIntercept,
  responseIntercept,
  requestError,
  responseError,
};

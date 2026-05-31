import { decrypt, encrypt, getAESSecret, rsaEncryptLong, rsaDecryptLong } from 'huasen-lib';

export const getHeadersValue = (headers, key) => {
  return headers[key] || headers[key.toLowerCase()];
};

/**
 * 创建浏览器端请求拦截器
 * 业务侧通过 options 注入 Vue 原型、token、loading、提示和未授权处理函数
 * @param {Object} options
 * @returns {Object}
 */
export function createBrowserInterceptors(options) {
  const storage = options.storage;
  let rsaPublicSecret = null;
  let aesSecret = storage.getItem(options.aesSecretKey);

  if (!aesSecret) {
    aesSecret = getAESSecret();
    storage.setItem(options.aesSecretKey, aesSecret);
  }

  function getUI() {
    return typeof options.getUI === 'function' ? options.getUI() : options.ui;
  }

  function requestIntercept(config) {
    const ui = getUI();
    if (options.startLoading) options.startLoading(config, ui);

    config.headers.Dot = options.dot;
    config.headers.Token = options.getToken();

    if (aesSecret && rsaPublicSecret) {
      config.headers['Secret-Key'] = rsaEncryptLong('public', rsaPublicSecret, JSON.stringify(aesSecret));
    }

    if (config.method === 'post' && config.data && ['rsa', 'aesinrsa'].includes(config._secret)) {
      try {
        let secretText;
        const secretMethod = config._secret;
        const realData = config.data;
        config.headers['Secret-Method'] = secretMethod;

        if (secretMethod === 'rsa' && rsaPublicSecret) {
          secretText = rsaEncryptLong('public', rsaPublicSecret, JSON.stringify(realData));
        } else if (secretMethod === 'aesinrsa' && rsaPublicSecret) {
          secretText = encrypt(JSON.stringify(realData), aesSecret);
        }

        config.data = secretText ? { _secret_text: secretText } : realData;
      } catch (error) {
        console.warn('加密失败：', error);
      }
    }

    return config;
  }

  function requestError(error) {
    const ui = getUI();
    if (options.resetLoading) options.resetLoading(null, ui);
    return Promise.reject(error);
  }

  function responseIntercept(result) {
    const ui = getUI();
    const { headers, config, status, data } = result;

    if (options.stopLoading) options.stopLoading(config, ui);

    const rsaScrect = getHeadersValue(headers, 'Rsa-Public-Secret');
    if (rsaScrect) {
      rsaPublicSecret = Buffer.from(rsaScrect, 'base64').toString();
    }

    if (headers['content-type'] === 'application/octet-stream') {
      return result;
    }

    const secretMethod = getHeadersValue(headers, 'Secret-Method');
    if (secretMethod) {
      try {
        let realRawData;
        switch (secretMethod) {
          case 'aes':
            realRawData = decrypt(data.data, aesSecret);
            break;
          case 'rsa':
            realRawData = rsaDecryptLong('public', rsaPublicSecret, data.data);
            break;
        }
        data.data = realRawData ? JSON.parse(realRawData) : data.data;
      } catch (error) {
        localStorage.removeItem(options.aesSecretKey);
        console.warn('解密失败：', error);
      }
    }

    if (config._isMock) {
      console.group();
      console.warn('mockUrl：', config.url);
      console.warn('mockData：', data);
      console.groupEnd();
    }

    if (status === 200) {
      if (config._notify) ui.$tips('success', data.msg, 'top-right', 1200);
      return data;
    } else if (status === 204) {
      if (config._errorNotify) ui.$tips('warning', data.msg, 'top-right', 1200);
    }

    return Promise.reject(result);
  }

  function responseError(error) {
    const ui = getUI();
    if (options.logResponseError) console.error('请求发生异常：', error);
    if (options.resetLoading) options.resetLoading(null, ui);

    const { config, response } = typeof error === 'object' ? error : {};
    if (!navigator.onLine) {
      ui.$tips('error', '请检查网络是否连接', 'top-right', 2000);
    } else if (response.status == 400) {
      if (config._errorNotify) ui.$tips('error', response.data.msg, 'top-right', 2000);
    } else if (response.status == 401) {
      if (config._errorNotify) ui.$tips('warning', response.data.msg, 'top-right', 2000);
      if (options.onUnauthorized) options.onUnauthorized(error);
    } else if (response.status == 403) {
      if (config._errorNotify) ui.$tips('error', response.data.msg, 'top-right', 2000);
      if (options.onForbidden) options.onForbidden(error);
    } else {
      ui.$tips('error', '服务异常，稍后重试！', 'top-right', 2000);
    }

    return Promise.reject(error);
  }

  return {
    requestIntercept,
    responseIntercept,
    requestError,
    responseError,
  };
}

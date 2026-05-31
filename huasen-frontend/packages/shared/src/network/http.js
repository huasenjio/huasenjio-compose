import axios from 'axios';

import { tool } from 'huasen-lib';

/**
 * 创建 axios 请求方法
 * @param {Object} Config - 网络默认配置
 * @param {Object} Intercept - 请求/响应拦截器集合
 * @returns {Function}
 */
export function createHttp(Config, Intercept) {
  return function http(option) {
    const axiosEx = axios.create({
      baseURL: Config.baseURL,
      timeout: Config.timeout,
      cancelToken: option.cancelToken,
    });

    axios.defaults.withCredentials = Config.withCredentials;
    axiosEx.defaults.headers.post['Content-Type'] = Config.contentType;
    axiosEx.interceptors.request.use(Intercept.requestIntercept, Intercept.requestError);
    axiosEx.interceptors.response.use(Intercept.responseIntercept, Intercept.responseError);

    return axiosEx(option);
  };
}

/**
 * JSONP 方式进行 get 网络请求
 * @param {String} url - 请求链接
 * @param {Object} data - 参数键值对
 * @returns {Promise}
 */
export function jsonp(url, data) {
  return new Promise((resolve, reject) => {
    try {
      const body = document.body;
      const script = document.createElement('script');
      window[data.cb] = function (res) {
        resolve(res);
      };
      script.src = tool.handleURL(url, data);
      body.appendChild(script);
      body.removeChild(script);
    } catch (e) {
      reject(e);
    }
  });
}

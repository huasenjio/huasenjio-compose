import axios from 'axios';

/**
 * 创建前端网络默认配置
 * @param {Object} overrides - 覆盖默认配置
 * @returns {Object}
 */
export function createNetworkConfig(overrides = {}) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  const isDev = process.env.NODE_ENV === 'development';

  return {
    baseURL: isDev ? '/dev' : '/api',
    contentType: 'application/x-www-form-urlencoded',
    timeout: 180000,
    withCredentials: true,
    globalMock: isDev ? true : false,
    globalSecret: isDev ? null : null,
    globalNotify: true,
    globalErrorNotify: true,
    globalLoading: true,
    cancelToken: source.token,
    source,
    ...overrides,
  };
}

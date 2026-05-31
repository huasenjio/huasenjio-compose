/*
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-21 00:03:59
 * @Description: 自动实现注册mock随机数据的请求工具
 */

import { createHttp, createNetworkConfig, createRequestMethods, jsonp } from '@huasen/shared';

import Intercept from './intercept.js';

const Config = createNetworkConfig();
const http = createHttp(Config, Intercept);

const { get, post, upload, downloadFileByUrl, downloadFileByBlob } = createRequestMethods({
  Config,
  http,
  useGlobalMockGate: true,
  enableLoadingOption: true,
});

export { Config, http, jsonp, get, post, upload, downloadFileByUrl, downloadFileByBlob };

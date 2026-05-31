/*
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-12-03 21:11:09
 * @Description: 统一配置请求拦截器
 */

import Vue from 'vue';
import { createBrowserInterceptors } from '@huasen/shared';

import state from '@/store/state/state.js';
import storage from '@/plugin/storage.js';
import constant from '@/constant/index.js';

export default createBrowserInterceptors({
  storage,
  aesSecretKey: constant.localAESSecret,
  dot: 'user',
  getUI: () => Vue.prototype,
  getToken: () => storage.getItem(constant.TOKEN_KEY) || state.user.token || '***·***·***',
  startLoading: (config, that) => {
    if (config._loading) that.$startLoading();
  },
  stopLoading: (config, that) => {
    if (config._loading) that.$resetLoading();
  },
  resetLoading: (config, that) => that.$resetLoading(),
  logResponseError: true,
});

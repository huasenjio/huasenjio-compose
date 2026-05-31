/* eslint-disable */

/*
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-26 21:32:10
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
  dot: 'manage',
  getUI: () => Vue.prototype,
  getToken: () => storage.getItem(constant.TOKEN_KEY) || state.manage.token || '***·***·***',
  startLoading: (config, that) => {
    if (config._loading) that.$startLoading();
  },
  stopLoading: (config, that) => {
    if (config._loading) that.$stopLoading();
  },
  resetLoading: (config, that) => that.$resetLoading(),
  onUnauthorized: () => {
    state.loaded = false;
  },
  onForbidden: () => {
    state.loaded = false;
  },
});

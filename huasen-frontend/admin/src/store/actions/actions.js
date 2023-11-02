/*
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-04 00:09:07
 * @Description:
 */

import Vue from 'vue';
const that = Vue.prototype;
export default {
  // 初始化本地管理员
  initManage(store, payload) {
    try {
      let manage = that.STORAGE.getItem(that.CONSTANT.localManage);
      if (manage) {
        store.commit('commitAll', {
          manage: {
            id: manage.id,
            token: manage.token,
            code: manage.code,
          },
          showWrapSign: false,
        });
      }
    } catch (err) {
      that.$tips('error', '初始化失败', 'top-right', 2000, () => {
        that.STORAGE.clear();
      });
    }
  },

  // 初始化项目配置
  async initAppConfig(store, payload) {
    try {
      let res = await that.API.findAppConfig();
      let site = {
        name: that.LODASH.get(res.data, 'site.brandName') || '花森',
        logoURL: that.LODASH.get(res.data, 'site.brandUrl') || require('@/assets/img/logo/favicon.svg'),
      };
      store.commit('commitAll', {
        site,
      });
    } catch (err) {
      console.log(err);
      // that.$tips('error', '初始化配置失败', 'top-right', 1000, () => {});
    }
  },
};

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
        name: that.LODASH.get(res.data, 'site.name') || '花森',
        logoURL: that.LODASH.get(res.data, 'site.logoURL') || require('@/assets/img/logo/favicon.svg'),
        redirectURL: that.LODASH.get(res.data, 'site.redirectURL') || 'http://huasen.cc/',
        home: {
          title: that.LODASH.get(res.data, 'site.home.title') || '花森小窝',
          url: that.LODASH.get(res.data, 'site.home.url') || 'http://huasen.cc/',
        },
      };
      store.commit('commitAll', {
        site,
      });
    } catch (err) {
      that.$tips('error', '初始化配置失败', 'top-right', 1000, () => {
        location.reload();
      });
    }
  },
};

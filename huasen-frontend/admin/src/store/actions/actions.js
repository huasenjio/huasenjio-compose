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
      let { onload } = payload;
      let manage = that.STORAGE.getItem(that.CONSTANT.localManage);
      if (manage) {
        store.commit('commitAll', {
          manage: {
            id: manage.id,
            token: manage.token,
            code: manage.code,
          },
        });
      }
      if (typeof onload === 'function') onload();
    } catch (err) {
      that.$tips('error', '初始化失败', 'top-right', 2000, () => {
        that.STORAGE.clear('本地数据异常，点击“确定”，重置网站所有数据和功能，解决疑难杂症，您继续吗？', {
          onConfirm: () => {
            // 刷新页面
            location.reload();
          },
          onCancel: () => { },
        });
      });
    }
  },

  // 初始化项目配置
  async initAppConfig(store, payload) {
    try {
      let res = await that.API.app.findAppConfig({}, {
        notify: false,
      });
      let site = {
        brandName: that.LODASH.get(res.data, 'site.brandName'),
        brandUrl: that.LODASH.get(res.data, 'site.brandUrl'),
      };
      store.commit('commitAll', {
        site,
        loaded: true,
      });
    } catch (err) {
      console.log(err);
      // that.$tips('error', '初始化配置失败', 'top-right', 1000, () => {});
    }
  },

  // 添加缓存的路由组件
  addCache({ state, dispatch }, componentName) {
    const { caches } = state;
    if (!componentName || caches.includes(componentName)) return;
    caches.push(componentName);
  },

  // 移除缓存的路由组件
  removeCache({ state, dispatch }, componentName) {
    const { caches } = state;
    const index = caches.indexOf(componentName);
    if (index > -1) {
      return caches.splice(index, 1)[0];
    }
  },

  // 移除缓存的路由组件的实例
  async removeCacheEntry({ dispatch }, componentName) {
    const cacheRemoved = await dispatch('removeCache', componentName);
    if (cacheRemoved) {
      await Vue.nextTick();
      dispatch('addCache', componentName);
    }
  },
};

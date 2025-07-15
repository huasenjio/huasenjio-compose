/*
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-19 16:36:44
 * @Description:
 */

import Vue from 'vue';
import { tool } from 'huasen-lib';
const that = Vue.prototype;

export default {
  // 初始化配置
  async initAppConfigInfo(context, payload) {
    let { callback } = { ...payload };
    let res = await that.API.App.findAppConfig({}, { notify: false });
    const config = res.data;
    try {
      const searchConfig = that.LODASH.get(config, 'search');
      const asideConfig = that.LODASH.get(config, 'aside');
      const navConfig = that.LODASH.get(config, 'nav');
      const themeConfig = that.LODASH.get(config, 'theme');
      let state = {
        user: {
          config: {
            bg: that.LODASH.get(config, 'theme.default.bg'),
            headerFontColor: that.LODASH.get(config, 'theme.default.color'),
            cityCode: that.LODASH.get(config, 'site.cityCode'),
          },
        },
        appConfig: {
          loaded: true,
          site: {
            brandName: that.LODASH.get(config, 'site.brandName'),
            brandUrl: that.LODASH.get(config, 'site.brandUrl'),
            footerHtml: that.LODASH.get(config, 'site.footerHtml'),
            openLabelClassification: that.LODASH.get(config, 'site.openLabelClassification'),
            autoIconPatch: that.LODASH.get(config, 'site.autoIconPatch'),
            notifyArticleId: that.LODASH.get(config, 'site.notifyArticleId'),
            authorization: that.LODASH.get(config, 'site.authorization'),
          },
        },
        searchConfig: searchConfig,
        asideConfig: asideConfig,
        navConfig: navConfig,
        themeConfig: themeConfig,
      };
      // 默认配置合并
      context.commit('commitAll', state);
      // 请求配置成功回调，处理document.title
      if (callback) callback();
      console.log('初始化配置成功', state);
    } catch (err) {
      that.$tips('error', '初始化配置出错', 'top-right', 2000);
    }
  },

  // 解析本地缓存的用户配置，若不存在，则采用仓库默认设定值
  initLocalUserInfo(context, payload) {
    try {
      // 获取本地存储数据
      let user = that.STORAGE.getItem(that.CONSTANT.localUser);
      let config = tool.parseJSON(that.LODASH.get(user, 'config', '{}'), 'Object', {});
      let records = tool.parseJSON(that.LODASH.get(user, 'records', '[]'), 'Array', []);
      records = records.map(item => {
        // hs-todo：兼容旧版本使用的remark字段，多次大版本迭代后删除
        if (Object.prototype.hasOwnProperty.call(item, 'remark')) {
          item.remarks = item.remark;
          delete item.remark;
        }
        return item;
      });
      context.commit('commitAll', {
        user: {
          id: that.LODASH.get(user, 'id'),
          name: that.LODASH.get(user, 'name'),
          headImg: that.LODASH.get(user, 'headImg'),
          code: that.LODASH.get(user, 'code'),
          token: that.LODASH.get(user, 'token'),
          config: {
            bg: config.bg,
            headerFontColor: config.headerFontColor,
            bgFilter: config.bgFilter,
            bgLightness: config.bgLightness,
            simpleMode: config.simpleMode,
            theme: config.theme,
            searchAssociationCount: config.searchAssociationCount,
            searchBorderRadius: config.searchBorderRadius,
            searchEngineIndex: config.searchEngineIndex,
            showNavbar: config.showNavbar,
            cityCode: config.cityCode,
          },
          records,
        },
      });
    } catch (err) {
      that.STORAGE.clear('本地数据异常，点击“确定”，重置网站所有数据和功能，解决疑难杂症，您继续吗？', {
        onConfirm: () => {
          // 刷新页面
          location.reload();
        },
        onCancel: () => {},
      });
    }
  },

  // 初始化主题皮肤
  initLocalThemeInfo(context) {
    // 解析状态
    let theme = that.LODASH.get(context.state.user.config, 'theme', {});
    // 遍历id修改样式
    Object.keys(theme).map(id => {
      let node = document.getElementById(id);
      if (node) {
        node.classList.add('inherit-theme');
        node.style.color = theme[id].color;
        node.style.backgroundColor = theme[id].backgroundColor;
      }
    });
  },

  // treeshaking移除无效的theme配置
  treeshakingTheme(context) {
    let { user } = context.state;
    Object.keys(user.config.theme).forEach(key => {
      const node = document.getElementById(key);
      // 存在节点，说明是有效配置，无需删除
      if (node) {
        return;
      }
      delete user.config.theme[key];
    });
  },

  // 保存当前用户快照
  snapshoot(context, payload = {}) {
    let { paths = [] } = payload;
    let { user } = context.state;
    // 移除无效的theme
    context.dispatch('treeshakingTheme');
    if (paths.length) {
      let localUser = that.STORAGE.getItem(that.CONSTANT.localUser) || {};
      that.LODASH.set(localUser, 'records', tool.parseJSON(that.LODASH.get(localUser, 'records', '[]'), 'Array', []));
      that.LODASH.set(localUser, 'config', tool.parseJSON(that.LODASH.get(localUser, 'config', '{}'), 'Object', {}));
      // 变量需要存储的path，其相对于user属性路径，例如：id、name、config.simpleMode
      paths.forEach(path => {
        let value = that.LODASH.get(user, path);
        that.LODASH.set(localUser, path, value);
      });
      // 部分更新
      localUser.records = JSON.stringify(localUser.records);
      localUser.config = JSON.stringify(localUser.config);
      that.STORAGE.setItem(that.CONSTANT.localUser, localUser);
    } else {
      // 整体存储
      that.STORAGE.setItem(that.CONSTANT.localUser, {
        id: user.id,
        name: user.name,
        code: user.code,
        headImg: user.headImg,
        token: user.token,
        records: JSON.stringify(user.records),
        config: JSON.stringify(user.config),
      });
    }
    context.dispatch('initLocalThemeInfo');
  },
};

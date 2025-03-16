/*
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-19 16:36:44
 * @Description:
 */

import Vue from 'vue';
const that = Vue.prototype;

export default {
  // 解析本地缓存的用户配置，若不存在，则采用仓库默认设定值
  initLocalUserInfo(context, payload) {
    try {
      // 获取本地存储数据
      let user = that.STORAGE.getItem(that.CONSTANT.localUser);
      // 本地存储有用户数据
      if (user) {
        let config = { ...context.state.user.config, ...JSON.parse(user.config) };
        let records = JSON.parse(user.records);
        context.commit('commitAll', {
          user: {
            id: user.id,
            name: user.name,
            headImg: user.headImg,
            code: user.code,
            token: user.token,
            records,
            config,
          },
        });
      }
    } catch (err) {
      that.STORAGE.clear('本地数据异常，点击“确定”，重置网站所有数据和功能，解决疑难杂症，您继续吗？', {
        onConfirm: () => {
          // 刷新页面
          location.reload();
        },
        onCancel: () => { },
      });
    }
  },

  // 初始化主题皮肤
  initLocalStyleInfo(context, payload) {
    // 解析状态
    let localStyle = context.state.user.config.theme;
    // 遍历id修改样式
    Object.keys(localStyle).map(id => {
      let node = document.getElementById(id);
      if (node) {
        node.classList.add('inherit-theme');
        node.style.color = localStyle[id].color;
        node.style.backgroundColor = localStyle[id].backgroundColor;
      }
    });
  },

  // 初始化配置
  async initAppConfigInfo(context, payload) {
    let { callback } = { ...payload };
    let res = await that.API.App.findAppConfig({}, { notify: false });
    const config = res.data
    try {
      const searchConfig = that.LODASH.get(config, 'search')
      const asideConfig = that.LODASH.get(config, 'aside')
      const navConfig = that.LODASH.get(config, 'nav')
      const themeConfig = that.LODASH.get(config, 'theme')
      let state = {
        user: {
          config: {
            bg: that.LODASH.get(config, 'theme.default.bg'),
            headerFontColor: that.LODASH.get(config, 'theme.default.color'),
            cityCode: that.LODASH.get(config, 'site.cityCode')
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

  // 保存当前用户快照
  snapshoot(context, payload) {
    let { user } = context.state;
    Object.keys(user.config.theme).map(key => {
      let node = document.getElementById(key);
      // 过滤无用的theme配置
      if (!node) {
        delete user.config.theme[key];
      }
    });
    that.STORAGE.setItem(that.CONSTANT.localUser, {
      id: user.id,
      name: user.name,
      code: user.code,
      headImg: user.headImg,
      token: user.token,
      records: JSON.stringify(user.records),
      config: JSON.stringify(user.config),
    });
  },
};

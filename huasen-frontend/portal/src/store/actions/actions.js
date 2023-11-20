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

        // 提交更新
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
      that.$tips('error', '初始化失败', 'top-right', 2000, () => {
        that.STORAGE.clear();
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
    let res = await that.API.findAppConfig({}, { notify: false });
    try {
      let state = {
        appConfig: {
          loaded: true,
          article: that.LODASH.get(res.data, 'article'),
          site: {
            name: that.LODASH.get(res.data, 'site.brandName') || '花森',
            logoURL: that.LODASH.get(res.data, 'site.brandUrl') || require('@/assets/img/logo/favicon.svg'),
            redirectURL: that.LODASH.get(res.data, 'site.redirectUrl') || 'http://huasen.cc/',
            guidePageName: that.LODASH.get(res.data, 'site.guidePageName') || '花森小窝',
            guidePageUrl: that.LODASH.get(res.data, 'site.guidePageUrl') || 'http://huasen.cc/',
            footerHtml: that.LODASH.get(res.data, 'site.footerHtml') || '',
            openLabelClassification: that.LODASH.get(res.data, 'site.openLabelClassification') || false,
            serviceQRCodeUrl: that.LODASH.get(res.data, 'site.serviceQRCodeUrl') || require('@/assets/img/logo/weixin.png'),
          },
        },
        themeConfig: that.LODASH.get(res.data, 'theme'),
      };

      // 默认配置合并
      context.commit('commitAll', state);

      // 设置默认壁纸
      let bg = that.LODASH.get(res.data, 'theme.default.bg');
      let headerFontColor = that.LODASH.get(res.data, 'theme.default.color');

      if (bg) {
        context.commit('commitAll', {
          user: {
            config: {
              bg,
            },
          },
        });
      }

      if (headerFontColor) {
        context.commit('commitAll', {
          user: {
            config: {
              headerFontColor,
            },
          },
        });
      }

      context.commit('commitAll', state);

      // 请求配置成功回调，处理document.title
      if (callback) callback();

      console.log('初始化配置成功');
    } catch (err) {
      that.$tips('error', '初始化配置出错', 'top-right', 2000);
    }
  },

  // 保存当前用户快照
  snapshoot(context, payload) {
    let { user } = context.state;

    // 过滤无用的theme配置
    Object.keys(user.config.theme).map(key => {
      let node = document.getElementById(key);
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

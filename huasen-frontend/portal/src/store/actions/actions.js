/*
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-19 16:36:44
 * @Description:
 */

import Vue from 'vue';
import searchs from '@/config/search.config.js';
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
    let res = await that.API.User.findAppConfig({}, { notify: false });
    const config = res.data
    try {
      const autoIconPatch = that.LODASH.get(config, 'site.autoIconPatch')
      const searchConfig = that.LODASH.get(config, 'search')
      let state = {
        appConfig: {
          loaded: true,
          article: that.LODASH.get(config, 'article'),
          site: {
            name: that.LODASH.get(config, 'site.brandName') || '花森',
            logoURL: that.LODASH.get(config, 'site.brandUrl') || require('@/assets/img/logo/favicon.svg'),
            redirectURL: that.LODASH.get(config, 'site.redirectUrl') || 'http://huasenjio.top/',
            guidePageName: that.LODASH.get(config, 'site.guidePageName') || '花森小窝',
            guidePageUrl: that.LODASH.get(config, 'site.guidePageUrl') || 'http://huasenjio.top/',
            footerHtml: that.LODASH.get(config, 'site.footerHtml') || '',
            openLabelClassification: !!that.LODASH.get(config, 'site.openLabelClassification'),
            serviceQRCodeUrl: that.LODASH.get(config, 'site.serviceQRCodeUrl') || require('@/assets/img/logo/weixin.png'),
            autoIconPatch: autoIconPatch === undefined ? true : !!autoIconPatch,
          },
        },
        searchConfig: (searchConfig !== undefined && (Array.isArray(searchConfig) && searchConfig.length)) ? searchConfig : searchs,
        themeConfig: that.LODASH.get(config, 'theme'),
      };

      // 默认配置合并
      context.commit('commitAll', state);

      // 设置默认壁纸
      let bg = that.LODASH.get(config, 'theme.default.bg');
      let headerFontColor = that.LODASH.get(config, 'theme.default.color');

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

    Object.keys(user.config.theme).map(key => {
      let node = document.getElementById(key);
      if (!node) {
        // 过滤无用的theme配置
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

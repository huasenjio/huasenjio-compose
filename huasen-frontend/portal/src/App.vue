<!--
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-26 23:58:49
 * @Description: 入口文件
-->
<template>
  <div id="app" :style="appStyle">
    <BrowserTips v-if="!isSupport"></BrowserTips>
    <Wrap v-else> </Wrap>
  </div>
</template>

<script>
import Wrap from '@/components/content/wrap/Wrap.vue';
import BrowserTips from '@/components/content/browserTips/BrowserTips.vue';

import { mapState, mapActions } from 'vuex';
import { initScaleDocument, destoryScaleDocument } from '@/plugin/scale-document.js';

export default {
  name: 'App',

  data() {
    return {};
  },

  components: { Wrap, BrowserTips },

  computed: {
    ...mapState(['user', 'appConfig']),

    // 判断浏览器支持
    isSupport() {
      let temp = this.TOOL.judgeIE();
      console.log('浏览器信息：' + temp);
      if (temp === -1 || temp === 'edge') {
        return true;
      } else {
        return false;
      }
    },
    // 设置最小宽度
    appStyle() {
      return {
        minWidth: `${this.CONSTANT.appMinWidth}px`,
      };
    },
  },

  created() {
    // 移除开屏动画
    let loadingDOM = this.isSupport ? document.getElementById('js-app-loading__container--routine') : document.getElementById('js-app-loading__container--ie');
    if (loadingDOM) {
      document.body.removeChild(loadingDOM);
    }

    // 调整文档大小，避免网站在移动端网页中，无法适应屏幕的问题
    initScaleDocument();
  },

  async mounted() {
    // 优先处理应用配置
    await this.initAppConfigInfo({
      callback: () => {
        let brandName = this.LODASH.get(this.appConfig, 'site.name');
        if (brandName) {
          document.title = brandName;
        }
      },
    });

    // 加载处理用户信息
    await this.initLocalUserInfo();
    await this.initLocalStyleInfo();

    console.log('页面已挂载成功');
  },

  destroyed() {
    destoryScaleDocument();
  },

  methods: {
    // 导入vuex中的方法
    ...mapActions(['initLocalUserInfo', 'initLocalStyleInfo', 'initAppConfigInfo']),
  },
};
</script>

<style lang="scss">
@import url('./assets/css/index.css');
#app {
  position: relative;
  width: 100vw;
  height: 100vh;
}
</style>

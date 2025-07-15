<!--
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-11 22:07:57
 * @Description: 根组件
-->
<template>
  <div id="app">
    <BrowserTips v-if="!isSupport"></BrowserTips>
    <template v-else>
      <Wrap v-if="loaded"> </Wrap>
      <Sign v-else> </Sign>
    </template>
  </div>
</template>
<script>
import BrowserTips from '@/components/content/browser-tips/BrowserTips.vue';
import Wrap from '@/components/content/wrap/Wrap.vue';
import Sign from '@/components/content/sign/Sign.vue';
import { tool } from 'huasen-lib';

import { mapState } from 'vuex';
import watermark from '@/plugin/watermark.js';

export default {
  name: 'App',

  components: { BrowserTips, Wrap, Sign },

  data() {
    return {};
  },

  computed: {
    ...mapState(['loaded', 'manage']),
    // 判断浏览器支持
    isSupport() {
      let temp = tool.judgeIE();
      console.log('浏览器信息：' + temp);
      if (temp === -1 || temp === 'edge') {
        return true;
      } else {
        return false;
      }
    },
  },

  async created() {
    // 移除开屏动画
    let loadingDOM = this.isSupport ? document.getElementById('js-app-loading__container--routine') : document.getElementById('js-app-loading__container--ie');
    if (loadingDOM) {
      document.body.removeChild(loadingDOM);
    }
    // 请求版权信息
    await this.API.app.getCopyright({}, { notify: false });
    // 请求字典
    const dicRes = await this.API.app.getDictionary({}, { notify: false });
    this.CONSTANT.dictionary = dicRes.data;
    // 初始化本地数据
    await this.$store.dispatch('initManage', {
      onload: () => {
        watermark({
          watermark_txt: this.manage.id,
        });
      },
    });
    // 请求应用配置
    await this.$store.dispatch('initAppConfig');
  },
};
</script>

<style lang="scss">
@import url('./assets/css/index.css');
#app {
  position: relative;
  width: 100vw;
  height: 100vh;
  min-width: 1280px;
  min-height: 800px;
  overflow-x: hidden;
  overflow-y: hidden;
}
</style>

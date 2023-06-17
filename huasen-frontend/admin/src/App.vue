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
    <Wrap v-else> </Wrap>
  </div>
</template>
<script>
import BrowserTips from '@/components/content/browser-tips/BrowserTips.vue';
import Wrap from '@/components/content/wrap/Wrap.vue';

import { mapState } from 'vuex';
import watermark from '@/plugin/watermark.js';

export default {
  name: 'App',
  components: { Wrap, BrowserTips },
  computed: {
    ...mapState(['manage']),
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
  },
  mounted() {
    this.$store.dispatch('initManage');
    watermark({
      watermark_txt: this.manage.id,
    });
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

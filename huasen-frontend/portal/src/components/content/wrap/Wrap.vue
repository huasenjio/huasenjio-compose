<!--
 * @Autor: huasenjio
 * @Date: 2022-07-31 21:51:50
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-04-13 00:07:49
 * @Description: 框架组件
-->
<template>
  <div class="hs-wrap">
    <div class="wrap-body">
      <WrapLeft v-show="user.config.showNavbar && !simpleMode"></WrapLeft>
      <WrapRight v-show="!simpleMode"></WrapRight>
      <WrapSidebar v-show="showWrapSidebar && !simpleMode"></WrapSidebar>
      <WrapSign></WrapSign>
      <WrapPerson></WrapPerson>
      <WrapSimple v-show="simpleMode"></WrapSimple>
    </div>
    <div v-if="showWrapFooter && !simpleMode" v-discolor v-html="appConfig.site.footerHtml" class="wrap-footer"></div>
    <WrapNotice v-if="appConfig.loaded"></WrapNotice>
  </div>
</template>
<script>
import { mapState } from 'vuex';

import navs from '@/config/nav.config.js';

import WrapLeft from './left/WrapLeft.vue';
import WrapRight from './right/WrapRight.vue';
import WrapSidebar from './sidebar/WrapSidebar.vue';
import WrapSign from './sign/WrapSign.vue';
import WrapPerson from './person/WrapPerson.vue';
import WrapSimple from './simple/WrapSimple.vue';
import WrapNotice from './notice/WrapNotice.vue';

export default {
  name: 'HsWrap',

  components: { WrapLeft, WrapRight, WrapSidebar, WrapSign, WrapPerson, WrapSimple, WrapNotice },

  data() {
    return {
      navs,
      showNotice: true,
    };
  },

  computed: {
    ...mapState(['showWrapConnect', 'showWrapSidebar', 'user', 'appConfig']),
    simpleMode() {
      return this.user.config.simpleMode;
    },
    showWrapFooter() {
      return this.appConfig.site.footerHtml;
    },
  },

  methods: {
    handleNotice() {},
  },
};
</script>

<style lang="scss" scoped>
.hs-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .wrap-body {
    flex: 1;
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    overflow: hidden;
  }
  .wrap-footer {
    position: relative;
    width: 100%;
  }
}
</style>

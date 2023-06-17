<!--
 * @Autor: huasenjio
 * @Date: 2022-07-31 21:51:50
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-04-13 00:07:49
 * @Description: 框架组件
-->
<template>
  <div class="hs-wrap">
    <WrapLeft v-show="showWrapLeft && !simpleMode"></WrapLeft>
    <WrapRight v-show="!simpleMode"></WrapRight>
    <WrapSidebar v-show="showWrapSidebar && !simpleMode"></WrapSidebar>
    <WrapSign></WrapSign>
    <WrapPerson></WrapPerson>
    <WrapSimple v-if="simpleMode"></WrapSimple>
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

export default {
  name: 'HsWrap',

  components: { WrapLeft, WrapRight, WrapSidebar, WrapSign, WrapPerson, WrapSimple },

  data() {
    return {
      navs,
    };
  },

  computed: {
    ...mapState(['showWrapLeft', 'showWrapConnect', 'showWrapSidebar', 'user']),
    simpleMode() {
      return this.user.config.simpleMode;
    },
  },
};
</script>

<style lang="scss" scoped>
.hs-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
}
</style>

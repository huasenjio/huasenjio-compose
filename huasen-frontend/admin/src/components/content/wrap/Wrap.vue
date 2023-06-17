<!--
 * @Autor: huasenjio
 * @Date: 2021-10-30 18:17:36
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-20 01:12:11
 * @Description: 
-->
<template>
  <div class="hs-wrap">
    <WrapLeft v-if="showWrapLeft"></WrapLeft>
    <WrapRight></WrapRight>
    <WrapSign></WrapSign>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import WrapLeft from './left/WrapLeft.vue';
import WrapRight from './right/WrapRight.vue';
import WrapSign from './sign/WrapSign.vue';

export default {
  name: 'Wrap',
  components: { WrapLeft, WrapRight, WrapSign },
  computed: {
    ...mapState(['showWrapLeft']),
  },
};
</script>

<style lang="scss" scoped>
.hs-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

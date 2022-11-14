<!--
 * @Autor: huasenjio
 * @Date: 2022-08-28 18:50:19
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-09-18 10:20:05
 * @Description: 
-->

<template>
  <div class="wrap-right" :class="{ full: !showWrapLeft }">
    <router-view></router-view>
  </div>
</template>
<script>
import { mapState } from 'vuex';
export default {
  name: 'WrapRight',
  computed: {
    ...mapState(['showWrapLeft']),
  },
};
</script>

<style lang="scss" scoped>
.wrap-right {
  position: relative;
  width: calc(100% - 60px);
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: var(--gray-50);
}
.full {
  width: 100%;
}
</style>

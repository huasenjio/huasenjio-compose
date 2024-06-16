<!--
 * @Autor: huasenjio
 * @Date: 2022-08-28 18:50:19
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-09-18 10:20:05
 * @Description: 
-->

<template>
  <div class="wrap-right" :class="{ full: !user.config.showNavbar }">
    <keep-alive :max="2" :include="caches">
      <router-view></router-view>
    </keep-alive>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import routes from '@/config/router.config.json';

export default {
  name: 'WrapRight',
  computed: {
    ...mapState(['user']),
    caches() {
      let list = [];
      routes.forEach(item => {
        if (item.name && item.keepAlive) {
          list.push(item.name);
        }
      });
      return list;
    },
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

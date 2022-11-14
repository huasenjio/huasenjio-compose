<!--
 * @Autor: huasenjio
 * @Date: 2022-09-09 22:44:29
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-09-21 00:23:35
 * @Description: 
-->
<template>
  <div class="wrap-simple animate__animated animate__fadeInDown">
    <HomeWallpaper :fullscreen="true"></HomeWallpaper>
    <HomeSearch :top="'180px'"></HomeSearch>
    <!-- 关闭极简模式按钮 -->
    <i @click="closeSimpleMode" class="exit iconfont icon-md-qr-scanner mix-blend-lighten"></i>
  </div>
</template>
<script>
import { mapState, mapMutations, mapActions } from 'vuex';
import HomeSearch from '@/views/home/search/HomeSearch.vue';
import HomeWallpaper from '@/views/home/wallpaper/HomeWallpaper.vue';
export default {
  name: 'WrapSimple',
  components: { HomeWallpaper, HomeSearch },
  computed: {
    ...mapState(['user']),
  },
  mounted() {
    this.initLocalStyleInfo();
  },
  methods: {
    ...mapMutations(['commitAll']),
    ...mapActions(['snapshoot', 'initLocalStyleInfo']),
    closeSimpleMode() {
      this.commitAll({
        user: {
          config: {
            simpleMode: !this.user.config.simpleMode,
          },
        },
      });
      this.snapshoot();
    },
  },
};
</script>

<style lang="scss" scoped>
.wrap-simple {
  position: absolute;
  width: 100%;
  height: 100%;
  .exit {
    position: absolute;
    bottom: 18px;
    right: 28px;
    font-size: 24px;
    filter: invert(100%);
    cursor: pointer;
  }
}
</style>

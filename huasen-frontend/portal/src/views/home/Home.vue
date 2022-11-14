<!--
 * @Autor: huasenjio
 * @Date: 2022-07-31 21:51:50
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-22 00:18:31
 * @Description: 
-->
<template>
  <div class="home">
    <!-- 背景 -->
    <HomeWallpaper></HomeWallpaper>
    <!-- 主要内容 -->
    <section class="content">
      <HomeHead :headBgConfig="headBgConfig"></HomeHead>
      <main ref="homeContent" class="home-content">
        <HomeSearch></HomeSearch>
        <HomeRecord></HomeRecord>
        <HomeNav v-if="!categoryEmpty"></HomeNav>
        <HomeSite v-if="!categoryEmpty"></HomeSite>
        <!-- 空内容展示 -->
        <div v-if="categoryEmpty" class="empty-panel">
          <Empty></Empty>
        </div>
      </main>
    </section>
  </div>
</template>
<script>
import { mapState, mapMutations, mapActions } from 'vuex';

import Bus from '@/plugin/event-bus.js';
import * as BusType from '@/plugin/event-type.js';

import HomeHead from './head/HomeHead.vue';
import HomeWallpaper from './wallpaper/HomeWallpaper.vue';
import HomeSearch from './search/HomeSearch.vue';
import HomeRecord from './record/HomeRecord.vue';
import HomeNav from './nav/HomeNav.vue';
import HomeSite from './site/HomeSite.vue';

import Empty from '@/components/content/empty/Empty.vue';

export default {
  name: 'Home',
  components: { HomeHead, HomeWallpaper, HomeSearch, HomeRecord, HomeNav, HomeSite, Empty },
  data() {
    return {
      headBgConfig: {
        clear: true,
        white: false,
        grossGlass: false,
      },
    };
  },
  computed: {
    ...mapState(['categorySites']),
    categoryEmpty() {
      return this.categorySites.length === 0 ? true : false;
    },
  },
  mounted() {
    this.initScrollEvent();
    this.initEventBus();
    this.initLocalStyleInfo();
  },
  destroyed() {
    Bus.unSubEv(BusType.HOME_SCROLL_TO);
  },
  methods: {
    ...mapMutations(['commitAll']),
    ...mapActions(['initLocalStyleInfo']),
    // 按下tab，切换搜索引擎
    initScrollEvent() {
      let debounce = this.TOOL.debounce(event => {
        let temp = {
          clear: false,
          white: false,
          grossGlass: false,
        };
        if (event.target.scrollTop > 210) {
          this.commitAll({
            showWrapSidebarSocket: true,
          });
          temp.white = true;
        } else if (event.target.scrollTop > 30) {
          this.commitAll({
            showWrapSidebarSocket: true,
          });
          temp.grossGlass = true;
        } else {
          this.commitAll({
            showWrapSidebarSocket: false,
          });
          temp.clear = true;
        }
        this.headBgConfig = temp;
      }, 20);

      this.$refs.homeContent.addEventListener('scroll', debounce);
      this.$once('hook:beforeDestory', () => {
        this.$refs.homeContent.removeEventListener('scroll', debounce);
      });
    },

    initEventBus() {
      Bus.subEv(BusType.HOME_SCROLL_TO, y => {
        this.homeContentScrollTo(y);
      });
    },

    homeContentScrollTo(y) {
      this.$refs.homeContent.scrollTo({
        top: y,
        behavior: 'smooth',
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.home {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  .content {
    width: 100%;
    height: 100%;
    background-color: var(--gray-0);
    z-index: 1;
    .home-content {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      overflow-y: auto;
      .empty-panel {
        width: 100%;
        height: 100%;
        padding: 10px;
        background-color: var(--gray-50);
        box-sizing: border-box;
      }
    }
  }
}
</style>

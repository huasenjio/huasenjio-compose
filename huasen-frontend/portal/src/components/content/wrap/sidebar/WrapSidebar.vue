<!--
 * @Autor: huasenjio
 * @Date: 2022-08-28 23:45:07
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-27 00:16:16
 * @Description: 
-->
<template>
  <div class="wrap-sidebar">
    <ul>
      <li v-if="showWrapSidebarSocket" class="animate__animated animate__fadeIn shadow">
        <i class="iconfont icon-md-rocket" @click="goTop"></i>
      </li>
      <li class="shadow">
        <i class="iconfont icon-weixin" @mouseenter="showConnectPannel" @mouseleave="closeConnectPannel"> </i>
      </li>
      <li class="shadow" @click="readHelp">
        <i class="iconfont icon-md-help-circle"></i>
      </li>
    </ul>
    <section v-if="showConnect" class="connect-panel animate__animated animate__fadeIn">
      <img src="~@/assets/img/logo/weixin.png" />
    </section>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import Bus from '@/plugin/event-bus.js';
import { HOME_SCROLL_TO } from '@/plugin/event-type.js';
export default {
  name: 'WrapSidebar',
  data() {
    return {
      showConnect: false,
    };
  },
  computed: {
    ...mapState(['showWrapSidebarSocket', 'appConfig']),
  },
  methods: {
    ...mapMutations(['commitAll']),

    // 回到顶部
    goTop() {
      Bus.pubEv(HOME_SCROLL_TO, 0);
    },

    // 查看使用说明
    readHelp() {
      let help = this.appConfig.article.help;
      this.TOOL.jumpToRead(this, help);
    },

    showConnectPannel() {
      this.showConnect = true;
    },

    closeConnectPannel() {
      this.showConnect = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.wrap-sidebar {
  position: absolute;
  right: 0;
  bottom: 50px;
  z-index: 1;
  ul {
    li {
      width: 40px;
      height: 40px;
      margin: 10px 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      background-color: var(--gray-0);
      i {
        font-size: 24px;
        font-weight: bold;
      }
    }
  }
  .connect-panel {
    position: absolute;
    left: -110px;
    bottom: 18px;
    width: 120px;
    height: 120px;
    padding: 4px;
    background-color: var(--gray-400);
    box-sizing: border-box;
    &::after {
      content: '';
      position: absolute;
      top: calc(50% - 8px);
      right: -16px;
      border-width: 8px;
      border-color: transparent;
      border-left-color: var(--gray-400);
      border-style: solid;
    }
    img {
      width: 100%;
    }
  }
}
</style>

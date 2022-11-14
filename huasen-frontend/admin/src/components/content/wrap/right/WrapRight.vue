<!--
 * @Autor: huasenjio
 * @Date: 2022-09-30 21:51:09
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-20 01:14:14
 * @Description: 右侧内容区
-->
<template>
  <div class="wrap-right" :class="{ full: !showWrapLeft }">
    <header>
      <div class="left">
        <i class="iconfont icon-a-unfoldcross-line" @click="hiddenWrapLeft"></i>
      </div>
      <div class="right">
        <i class="iconfont icon-exit-line" @click="exit"></i>
      </div>
    </header>
    <main>
      <div class="title bg-indigo-400">{{ this.$route.meta.title }}</div>
      <div class="router-body">
        <router-view></router-view>
      </div>
      <div class="footer text">
        森 酱 后 台 管 理 由 腾 讯 云 强 力 驱 动 · 2021 年 2 月 3 日
      </div>
    </main>
  </div>
</template>
<script>
import { mapState } from 'vuex';
export default {
  name: 'WrapRight',
  computed: {
    ...mapState(['showWrapLeft']),
  },
  methods: {
    hiddenWrapLeft() {
      this.$store.commit('commitAll', {
        showWrapLeft: !this.showWrapLeft,
      });
    },
    exit() {
      this.STORAGE.clear();
      location.reload();
    },
  },
};
</script>

<style lang="scss" scoped>
.wrap-right {
  width: calc(100% - 200px);
  height: 100%;
  header {
    width: 100%;
    height: 60px;
    padding: 0 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    i {
      font-size: 28px;
      font-weight: 500;
      color: var(--gray-600);
      cursor: pointer;
    }
  }
  main {
    width: 100%;
    height: calc(100% - 60px);
    padding: 0 15px;
    background-color: var(--gray-100);
    .title {
      width: 100%;
      height: 50px;
      padding: 0 10px;
      display: flex;
      align-items: center;
      font-size: 18px;
      color: var(--gray-0);
      background-color: var(--indigo-400);
      box-sizing: border-box;
    }
    .router-body {
      width: 100%;
      height: calc(100% - 80px);
      overflow-x: hidden;
      overflow-y: auto;
      background-color: var(--gray-0);
    }
    .footer {
      width: 100%;
      height: 30px;
      padding: 0 10px;
      line-height: 30px;
      background-color: var(--gray-0);
    }
  }
}
.full {
  width: 100%;
}
</style>

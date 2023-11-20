<!--
 * @Autor: huasenjio
 * @Date: 2021-12-05 20:23:00
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-24 21:21:27
 * @Description: 锚点导航组件
-->
<template>
  <div v-rightMenu class="home-nav">
    <header></header>
    <main v-rightMenu>
      <ul v-balance v-rightMenu>
        <li class="record-item pointer text" v-for="(item, index) in categorySites" :key="index" @click="changeAnchorPosition(index)">
          {{ item.typeName }}
        </li>
      </ul>
    </main>
  </div>
</template>
<script>
import Bus from '@/plugin/event-bus.js';
import * as BusType from '@/plugin/event-type.js';
import { mapState } from 'vuex';

export default {
  name: 'HomeNav',
  computed: {
    ...mapState(['categorySites']),
  },
  methods: {
    // 修复锚点定位不准确，hash影响路由的异常
    changeAnchorPosition(index) {
      let target = document.getElementById(`site-anchor-${encodeURI(index)}`);
      // 没有找到节点，退出执行
      if (!target) return;
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      // 遍历所有锚点，取消高亮
      [...target.parentNode.children].map(item => {
        item.classList.remove('active-anchor');
      });
      // 设置活跃的锚点的样式名
      target.className = target.className + ' ' + 'active-anchor';
      this.$nextTick(() => {
        Bus.pubEv(BusType.HOME_SCROLL_TO, target.offsetTop);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.home-nav {
  width: 100%;
  padding-top: 10px;
  padding-bottom: 10px;
  box-sizing: border-box;
  background-color: var(--gray-50);
  main {
    width: calc(100% - 20px);
    margin: 0 auto;
    padding: 10px 0;
    box-sizing: border-box;
    background-color: var(--gray-0);
    ul {
      width: calc(100% - 20px);
      margin: 0 auto;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      background-color: var(--gray-50);
      .record-item {
        position: relative;
        width: 110px;
        padding: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
      }
    }
  }
}
</style>

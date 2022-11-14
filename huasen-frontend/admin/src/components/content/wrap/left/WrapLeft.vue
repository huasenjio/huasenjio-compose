<!--
 * @Autor: huasenjio
 * @Date: 2022-09-30 21:50:09
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-07 10:07:47
 * @Description: 左侧导航条
-->
<template>
  <div class="wrap-left">
    <div class="logo">
      <div class="text title">花森后台管理</div>
    </div>
    <div class="navbar">
      <router-link :to="item.path" v-for="item in this.navs" :key="item.path">
        <div class="router-item">
          <i :class="item.iconClass"></i>
          <div class="name text">{{ item.name }}</div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import navs from '@/config/nav.config.js';
export default {
  name: 'WrapLeft',
  data() {
    return {
      navs,
    };
  },
};
</script>

<style lang="scss" scoped>
.wrap-left {
  position: relative;
  width: 200px;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: var(--gray-700);
  .logo {
    width: 100%;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--gray-100);
    background-image: url('~@/assets/img/logo/favicon.svg');
    background-position: 18px center;
    background-size: 38px 38px;
    background-repeat: no-repeat;
    .title {
      position: relative;
      left: 20px;
      top: 5px;
      font-size: 20px;
    }
  }
  .navbar {
    .router-item {
      width: 100%;
      height: 54px;
      display: flex;
      align-items: center;
      padding: 15px 0;
      color: var(--gray-300);
      i {
        margin-left: 20px;
        font-size: 24px;
      }
      .name {
        margin-left: 10px;
        font-size: 16px;
      }
    }
    .router-link-active {
      .router-item {
        color: var(--gray-0);
        background-color: var(--gray-800);
      }
    }
  }
}
</style>

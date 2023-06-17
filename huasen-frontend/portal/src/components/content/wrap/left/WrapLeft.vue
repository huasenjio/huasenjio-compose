<!--
 * @Autor: huasenjio
 * @Date: 2022-08-28 18:32:13
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-11-04 00:27:27
 * @Description: 
-->
<template>
  <div v-rightMenu class="wrap-left">
    <div class="logo">
      <img src="~@/assets/img/logo/favicon.svg" />
    </div>
    <ul class="navbar">
      <router-link :to="item.path" v-for="(item, index) in this.navs" :key="index">
        <el-tooltip effect="dark" :content="item.name" placement="right">
          <li>
            <i :class="item.iconClass" class="inherit-text"> </i>
          </li>
        </el-tooltip>
      </router-link>
    </ul>
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
  width: 60px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  .logo {
    width: 100%;
    height: 75px;
    display: flex;
    justify-content: center;
    align-items: center;
    img {
      position: relative;
      left: 2px;
      width: 40px;
      height: 40px;
    }
  }
  .navbar {
    width: 100%;
    height: calc(100% - 75px);
    a {
      color: inherit;
      li {
        width: 32px;
        height: 32px;
        margin: 20px auto 0 auto;
        display: flex;
        justify-content: center;
        align-items: center;
        i {
          font-size: 28px;
          color: var(--gray-500);
        }
      }
    }
    .router-link-active {
      i {
        color: var(--red-500) !important;
      }
    }
  }
}
</style>

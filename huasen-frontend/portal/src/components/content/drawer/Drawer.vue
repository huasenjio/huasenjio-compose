<!--
 * @Autor: huasenjio
 * @Date: 2022-09-15 23:46:58
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-09-30 00:58:00
 * @Description: 二次封装el-drawer组件
-->

<template>
  <el-drawer class="drawer" ref="hsDrawer" v-bind="$attrs" v-on="$listeners" :style="drawerStyle">
    <slot></slot>
  </el-drawer>
</template>

<script>
export default {
  name: 'HsDrawer',
  computed: {
    drawerStyle() {
      let size = typeof this.$attrs.size === 'string' && /^\d+%$/.test(this.$attrs.size) ? this.$attrs.size : `${this.$attrs.size}px`;
      return {
        '--drawerMinWidth': size,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.drawer {
  overflow-x: auto !important;
  overflow-y: hidden !important;
  ::v-deep .el-drawer__container {
    min-width: var(--drawerMinWidth);
    .el-drawer {
      .el-drawer__header {
        margin: 0;
        padding: 0;
        padding: 20px;
        box-sizing: border-box;
      }
      .el-drawer__body {
        background-color: var(--gray-100);
      }
    }
  }
}
</style>

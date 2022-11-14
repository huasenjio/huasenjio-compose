<!--
 * @Autor: huasenjio
 * @Date: 2022-09-15 23:46:58
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-12 01:05:26
 * @Description: 二次封装el-drawer组件
-->

<template>
  <el-drawer class="drawer" ref="hsDrawer" v-bind="$attrs" v-on="$listeners" :size="size" :style="drawerStyle">
    <slot></slot>
  </el-drawer>
</template>

<script>
export default {
  name: 'HsDrawer',
  computed: {
    drawerStyle() {
      let size = this.$attrs.fullscreen ? `${this.CONSTANT.appMinWidth}px` : this.TOOL.handleSize(this.$attrs.size);
      return {
        '--drawerMinWidth': size,
      };
    },
    size() {
      return this.TOOL.handleSize(this.$attrs.size);
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

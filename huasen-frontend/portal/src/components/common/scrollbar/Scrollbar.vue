<template>
  <el-scrollbar class="h-scrollbar" ref="HScrollbar" style="width: 100%; height: 100%">
    <slot></slot>
  </el-scrollbar>
</template>

<script>
export default {
  name: 'HScrollbar',

  props: {
    wrapClass: {
      type: String,
    },
    wrapStyle: {
      type: Array,
      default: () => [{ width: '100%' }, { height: '100%' }],
    },
    viewClass: {
      type: String,
    },
    viewStyle: {
      type: Array,
      default: () => [{ width: '100%' }, { height: '100%' }],
    },
  },
};
</script>

<style lang="scss">
.h-scrollbar {
  .el-scrollbar__bar.is-horizontal {
    height: 4px;
  }
  .el-scrollbar__bar.is-vertical {
    width: 4px;
  }
}
</style>

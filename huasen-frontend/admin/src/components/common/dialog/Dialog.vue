<!--
 * @Autor: huasenjio
 * @Date: 2022-09-05 00:22:50
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-09-30 00:04:06
 * @Description: 二次封装el-dialog
-->
<template>
  <el-dialog ref="hsDialog" v-bind="$attrs" v-on="$listeners" :width="dialogWidth" :style="dialogStyle" @scroll.capture.native="handleScroll">
    <!-- 默认插槽 -->
    <slot></slot>
    <!-- 底部插槽 -->
    <span v-if="showFooter" slot="footer">
      <el-button v-if="buttons.cancel" @click="closeDialog">
        {{ buttons.cancel }}
      </el-button>
      <el-button v-if="buttons.comfirm" type="primary" @click="comfirmDialog">
        {{ buttons.comfirm }}
      </el-button>
    </span>
  </el-dialog>
</template>
<script>
import { AF } from '@/plugin/af.js';
export default {
  name: 'HsDialog',

  props: {
    // 设置width属性，所以不会透传width属性，进行二次处理
    width: {
      type: [Number, String],
      default: '420px',
    },
    // 默认最大高度为550px
    maxHeight: {
      type: [Number, String],
      default: '440px',
    },
    // 展示的组件
    buttons: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },

  data() {
    return {
      af: new AF(this, 100),
    };
  },

  computed: {
    // 是否全屏
    fullscreen() {
      return this.$attrs.fullscreen;
    },
    // 弹窗大小
    dialogWidth() {
      return this.TOOL.handleSize(this.width);
    },
    // 是否显示按钮
    showFooter() {
      return Object.keys(this.buttons).length === 0 ? false : true;
    },
    // 全屏状态下，设置最小宽度
    dialogStyle() {
      // 如果不是全屏状态下，使用用户传入的width属性作为最小宽度
      let minWidth = this.$attrs.fullscreen ? `${this.CONSTANT.appMinWidth}px` : this.TOOL.handleSize(this.width);
      let maxHeight = this.$attrs.fullscreen ? 'calc(100% - 54px - 70px)' : this.TOOL.handleSize(this.maxHeight);
      return {
        '--dialogMinWidth': minWidth,
        '--dialogBodyMaxHeight': maxHeight,
      };
    },
  },

  methods: {
    // 关闭弹窗回调
    closeDialog() {
      this.$emit('closeDialog');
    },
    // 确认弹窗回调
    comfirmDialog() {
      this.$emit('comfirmDialog');
    },
    // 滚动时，隐藏下拉选择框
    handleScroll(ev) {
      this.af.run(() => {
        let nodes = document.getElementsByClassName('el-select-dropdown');
        for (let i = 0; i < nodes.length; i++) {
          nodes[i].style.display = 'none';
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .el-dialog {
  min-width: var(--dialogMinWidth) !important;
  .el-dialog__body {
    max-height: var(--dialogBodyMaxHeight) !important;
    overflow-x: hidden;
    overflow-y: auto;
  }
}
</style>

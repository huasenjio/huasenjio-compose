<!--
 * @Autor: huasenjio
 * @Date: 2022-09-05 00:22:50
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-05-06 23:02:04
 * @Description: 二次封装el-dialog
-->
<template>
  <el-dialog ref="hsDialog" :class="{ 'shadow-dialog': showShadow }" v-bind="$attrs" v-on="$listeners" :width="dialogWidth" :style="dialogStyle" @scroll.capture.native="handleScroll">
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
    // 是否显示按钮
    showFooter() {
      return Object.keys(this.buttons).length === 0 ? false : true;
    },
    showShadow() {
      return this.$attrs.title;
    },
    // 弹窗大小
    dialogWidth() {
      return this.TOOL.handleSize(this.width);
    },
    // 全屏状态下，设置最小宽度
    dialogStyle() {
      // 如果不是全屏状态下，使用用户传入的width属性作为最小宽度
      let minWidth = this.$attrs.fullscreen ? `${this.CONSTANT.appMinWidth}px` : this.TOOL.handleSize(this.width);
      let maxHeight = this.$attrs.fullscreen ? 'calc(100% - 54px - 62px)' : this.TOOL.handleSize(this.maxHeight);
      let height = this.$attrs.fullscreen ? 'calc(100% - 54px - 62px)' : '';
      return {
        '--dialogMinWidth': minWidth,
        '--dialogBodyMaxHeight': maxHeight,
        '--dialogBodyHeight': height,
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
  .el-dialog__header {
  }
  .el-dialog__body {
    height: var(--dialogBodyHeight) !important;
    max-height: var(--dialogBodyMaxHeight) !important;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .el-dialog__footer {
    padding: 10px 20px;
  }
}
</style>

<style lang="scss">
.shadow-dialog {
  .el-dialog__header {
    border-bottom: 1px solid var(--gray-100);
    box-shadow: 0 5px 6px -5px var(--gray-200);
  }
  .el-dialog__footer {
    border-top: 1px solid var(--gray-100);
    box-shadow: 0px -5px 6px -5px var(--gray-200);
  }
}
</style>

<!--
 * @Autor: huasenjio
 * @Date: 2022-09-05 00:22:50
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-19 13:45:20
 * @Description: 二次封装el-dialog
-->
<template>
  <el-dialog ref="hsDialog" :title="title" :fullscreen="full" v-bind="$attrs" v-on="$listeners" :width="dialogWidth" :style="dialogStyle" @scroll.capture.native="handleScroll" @contextmenu.native.stop>
    <!-- 标题插槽 -->
    <div class="w-full" slot="title">
      <div class="hs-dialog__title w-full flex">
        <div class="title__text text" :title="title">{{ title }}</div>
        <div v-if="showMax" class="title__max" @click="handleMax">
          <i class="el-icon-full-screen" :class="{ active: full }"></i>
        </div>
      </div>
    </div>
    <!-- 默认插槽 -->
    <slot></slot>
    <!-- 底部插槽 -->
    <span v-if="showFooter" slot="footer">
      <el-button size="small" v-if="buttons.cancel" @click="closeDialog">
        {{ buttons.cancel }}
      </el-button>
      <el-button size="small" v-if="buttons.comfirm" type="primary" @click="comfirmDialog">
        {{ buttons.comfirm }}
      </el-button>
    </span>
  </el-dialog>
</template>
<script>
import { AF } from '@/plugin/AF.js';
export default {
  name: 'HsDialog',

  props: {
    title: {
      type: String,
      default: '弹窗标题',
    },
    // 设置width属性，所以不会透传width属性，进行二次处理，默认435px
    width: {
      type: [Number, String],
      default: '420px',
    },
    height: {
      type: [Number, String],
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
        return {
          // comfirm: '确定',
          // cancel: '取消',
        };
      },
    },
    // 是否最大化
    showMax: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      af: new AF(this, 100),
      full: false,
    };
  },

  watch: {
    fullscreen: {
      handler(val) {
        this.full = !!val;
      },
      immediate: true,
    },
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
    // 全屏状态下，默认最小宽度
    dialogStyle() {
      let headHeight = 55;
      let footerHeight = Object.keys(this.buttons).length ? 62 : 0;
      let bodyMaxHeight = `calc(100% - ${headHeight}px - ${footerHeight}px - 62px)`;
      // 如果不是全屏状态下，使用用户传入的width属性作为最小宽度
      let dialogMinWidth = this.full ? `${this.CONSTANT.appMinWidth}px` : this.TOOL.handleSize(this.width);
      let dialogBodyMaxHeight = this.full ? bodyMaxHeight : this.TOOL.handleSize(this.maxHeight);
      let bodyHeight = this.full ? bodyMaxHeight : this.height ? this.TOOL.handleSize(this.height) : bodyMaxHeight;
      return {
        '--dialogMinWidth': dialogMinWidth,
        '--dialogBodyMaxHeight': dialogBodyMaxHeight,
        '--dialogBodyHeight': bodyHeight,
      };
    },
  },

  methods: {
    handleMax() {
      this.full = !this.full;
    },
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
        // 下拉选择组件的滚动不关闭dropdown
        if (ev.target._prevClass && !ev.target._prevClass.includes('el-select-dropdown__wrap')) {
          let nodes = document.getElementsByClassName('el-select-dropdown');
          for (let i = 0; i < nodes.length; i++) {
            nodes[i].style.display = 'none';
          }
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
    .title__text {
      width: calc(100% - 44px);
      font-size: 18px;
    }
    .title__max {
      width: 44px;
      color: var(--gray-500);
      i {
        font-size: 20px;
        &:hover {
          color: var(--ui-theme);
        }
      }
      .active {
        color: var(--ui-theme);
      }
    }
    .el-dialog__close {
      font-size: 20px;
      color: var(--gray-500);
      &:hover {
        color: var(--ui-theme);
      }
    }
  }
  .el-dialog__body {
    padding: 20px;
    height: var(--dialogBodyHeight) !important;
    max-height: var(--dialogBodyMaxHeight) !important;
    overflow-x: hidden;
    overflow-y: auto;
  }
}
</style>

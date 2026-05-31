<!--
 * @Autor: huasenjio
 * @Date: 2022-09-09 23:52:56
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-22 00:19:48
 * @Description: 右键菜单容器
-->
<template>
  <div ref="rightMenuContent" class="right-menu" :id="menuId" :style="menuStyle">
    <div class="point"></div>
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'RightMenu',

  props: {
    clientX: {
      type: Number,
      default: 0,
    },
    clientY: {
      type: Number,
      default: 0,
    },
    menuId: {
      type: [Number, String],
      default: 'menuId',
    },
  },

  computed: {
    menuStyle() {
      let style = {};
      style.top = `${this.clientY}px`;
      style.left = `${this.clientX}px`;
      return style;
    },
  },
};
</script>

<style lang="scss" scoped>
.right-menu {
  position: absolute;
  padding: 10px;
  box-sizing: border-box;
  z-index: 1000;
  .point {
    position: absolute;
    left: -5px;
    top: -5px;
    width: 10px;
    height: 10px;
    border: 0 solid transparent;
    border-radius: 50%;
  }
  .point::before {
    content: '';
    border: 6px solid var(--gray-400);
    border-radius: 50%;
    width: inherit;
    height: inherit;
    position: absolute;
    animation: loader 2s linear infinite;
    opacity: 0;
  }
  .point::after {
    content: '';
    border: 6px solid var(--gray-400);
    border-radius: 50%;
    width: inherit;
    height: inherit;
    position: absolute;
    animation: loader 2s linear infinite;
    opacity: 0;
  }

  .point::before {
    animation-delay: 1s;
  }

  @keyframes loader {
    0% {
      transform: scale(1);
      opacity: 0;
      border-color: var(--red-500);
    }

    50% {
      opacity: 1;
      border-color: var(--blue-500);
    }

    100% {
      transform: scale(0);
      opacity: 0;
      border-color: var(--green-500);
    }
  }
}
</style>

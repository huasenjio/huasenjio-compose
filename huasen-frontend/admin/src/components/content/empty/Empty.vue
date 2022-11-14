<!--
 * @Autor: huasenjio
 * @Date: 2022-09-09 00:24:16
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-10 01:55:11
 * @Description: 
-->
<template>
  <div :style="style" class="empty">
    <main>
      <img class="w-full" src="./img/empty.png" />
      <div class="w-full text">空空如也</div>
    </main>
  </div>
</template>
<script>
export default {
  name: 'Empty',

  props: {
    width: {
      type: [Number, String],
      default: '100%',
    },
    height: {
      type: [Number, String],
      default: '100%',
    },
  },

  computed: {
    style() {
      return {
        '--emptyWidth': this.TOOL.handleSize(this.width),
        '--emptyHeight': this.TOOL.handleSize(this.height),
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.empty {
  width: var(--emptyWidth);
  height: var(--emptyHeight);
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  overflow: auto;

  background-color: var(--gray-0);
  main {
    width: 200px;
    height: 200px;
    img {
      width: 100%;
      height: auto;
    }
    div {
      text-align: center;
      color: var(--gray-700);
    }
  }
}
</style>

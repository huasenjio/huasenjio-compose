<template>
  <div class="empty" :style="style">
    <main>
      <img class="w-full" :src="emptyImg" />
      <div class="w-full text">{{ description }}</div>
    </main>
  </div>
</template>
<script>
import { handleSize } from '@huasen/shared';

export default {
  name: 'HEmpty',
  props: {
    width: {
      type: [Number, String],
      default: '100%',
    },
    height: {
      type: [Number, String],
      default: '100%',
    },
    description: {
      type: String,
      default: '空空如也',
    },
    minWidth: {
      type: [Number, String],
      default: 1280,
    },
    discolor: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    emptyImg() {
      return require('./img/empty/empty.png');
    },
    style() {
      return {
        '--emptyWidth': handleSize(this.width, this.minWidth),
        '--emptyHeight': handleSize(this.height, this.minWidth),
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

<!--
 * @Autor: huasenjio
 * @Date: 2023-03-26 14:21:48
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-05-23 23:33:03
 * @Description: 
-->
<template>
  <div class="icon-result-container">
    <div class="result w-px-60 h-px-60  text-center text-gray-50" :style="{ backgroundColor: color }">
      <div v-if="isTextMode" class="text-group text w-full h-full">{{ text }}</div>
      <img v-else v-lazy="{ unload: require('@/assets/img/error/image-error.png') }" class="img-group w-full h-full" :src="url" alt="img" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'IconResultContainer',

  props: {
    isTextMode: {
      type: Boolean,
      default: true,
    },
    color: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '文字',
    },
    url: {
      type: String,
      default: '',
    },
  },

  watch: {
    url: {
      handler(val) {
        this.$forceUpdate();
      },
      deep: true,
      immediate: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.icon-result-container {
  width: 60px;
  height: 60px;
  .result {
    padding: 2px;
    .text-group {
      line-height: 60px;
      font-size: 16px;
      letter-spacing: 1.2px;
      color: var(--gray-50);
      text-shadow: 0px 1.5px 1.5px #000;
    }
    .img-group {
    }
  }
}
</style>

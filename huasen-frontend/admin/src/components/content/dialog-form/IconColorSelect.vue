<!--
 * @Autor: huasenjio
 * @Date: 2023-03-26 14:09:30
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-26 17:41:45
 * @Description: 
-->

<template>
  <div class="icon-color-select">
    <div>图标背景</div>
    <ul class="flex">
      <li class="color-item w-px-26 h-px-26 ml-px-10 first:ml-px-0 rounded" v-for="(colorItem, index) in colors" :key="index" :style="{ backgroundColor: colorItem }" @click="changeColor(colorItem)"></li>
      <li class="ml-px-10">
        <el-color-picker v-model="currentColor" size="mini" show-alpha @change="changeColor"> </el-color-picker>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'IconColorSelect',

  props: {
    color: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      currentColor: '',
      colors: ['#1582ff', '#fcbe22', '#fd4648', '#0b9669', '#7d3aed', '#5046e4', '#044192', '#4b5563', 'transparent'],
    };
  },

  mounted() {
    this.currentColor = this.color;
  },

  methods: {
    changeColor(color) {
      this.$emit('update:color', color);
    },
  },
};
</script>

<style lang="scss" scoped>
.icon-color-select {
  .color-item {
    border: 1px dashed var(--gray-400);
  }
}
</style>

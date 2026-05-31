<template>
  <div class="h-icon-box hidden" :style="{ width: size, height: size, borderRadius: radius }">
    <i v-if="isFontIcon" :class="icon" :style="{ fontSize: size, color }"></i>
    <img v-lazy v-else :src="icon" class="w-full h-full" />
  </div>
</template>
<script>
export default {
  name: 'IconBox',
  props: {
    icon: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: '24px',
    },
    color: {
      type: String,
      default: '',
    },
    radius: {
      type: String,
      default: '0px',
    },
  },

  computed: {
    isFontIcon() {
      const icon = this.icon;
      return /^http/.test(icon) || /^huasen-store\//.test(icon) ? false : true;
    },
  },
};
</script>

<style lang="scss" scoped>
.h-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

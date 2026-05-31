<template>
  <span class="h-icon" :class="rootClass" :style="rootStyle">
    <img v-if="showImage" :src="src" :class="imgClass" :style="imgStyle" @error="onError" />
    <i v-else :class="displayIcon"></i>
  </span>
</template>

<script>
export default {
  name: 'HIcon',
  props: {
    src: { type: String, default: '' },
    defaultIcon: { type: String, default: 'el-icon-picture-outline' },
    errorIcon: { type: String, default: 'el-icon-warning-outline' },
    size: { type: [Number, String], default: '' },
    imgClass: { type: String, default: '' },
    imgStyle: {
      type: Object,
      default: () => ({}),
    },
  },
  data: function () {
    return { error: false };
  },
  computed: {
    isImage: function () {
      if (!this.src || this.error) return false;
      const s = this.src.trim();
      return (
        /^(https?:)?\/\//.test(s) ||
        s.indexOf('data:image/') === 0 ||
        s.indexOf('blob:') === 0 ||
        s.indexOf('/huasen-store') === 0 ||
        s.indexOf('huasen-store/') === 0 ||
        /\.(png|jpe?g|gif|webp|svg|ico|bmp)(\?.*)?$/i.test(s)
      );
    },
    showImage: function () {
      return this.isImage;
    },
    displayIcon: function () {
      if (this.error) return this.errorIcon;
      return this.src || this.defaultIcon;
    },
    rootClass: function () {
      return {
        'is-image': this.showImage,
        'is-icon': !this.showImage,
        'is-error': this.error,
        'is-empty': !this.src,
      };
    },
    rootStyle: function () {
      if (!this.size) return {};
      var value = typeof this.size === 'number' ? this.size + 'px' : this.size;
      return {
        width: value,
        height: value,
        fontSize: value,
      };
    },
  },
  watch: {
    src: function () {
      this.error = false;
    },
  },
  methods: {
    onError: function () {
      this.error = true;
    },
  },
};
</script>

<style scoped>
.h-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  line-height: 1;
  vertical-align: -0.125em;
  overflow: hidden;
}

.h-icon img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.h-icon i {
  font-size: inherit;
  line-height: 1;
}

.h-icon.is-error i {
  color: var(--danger-600);
}

.h-icon.is-empty i {
  color: var(--gray-600);
}
</style>

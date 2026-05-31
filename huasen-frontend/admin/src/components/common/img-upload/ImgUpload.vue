<template>
  <div class="img-upload relative" :style="{ width: size, height: size }">
    <img v-lazy="{ unload: require('@/assets/img/error/image-error.png') }" class="max-w-full max-h-full" :src="url" />
    <div class="img-upload__shadow flex-center">
      <i class="el-icon-upload text-white"></i>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImgUpload',
  props: {
    size: {
      type: String,
      default: '48px',
    },
    url: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss" scoped>
.img-upload {
  position: relative;
  .img-upload__shadow {
    visibility: hidden;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    transition: all 0.3s ease;
    border-radius: 2px;
    cursor: pointer;
  }
  &:hover {
    .img-upload__shadow {
      visibility: visible;
    }
  }
}
</style>

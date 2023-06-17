<!--
 * @Autor: huasenjio
 * @Date: 2022-09-22 23:07:42
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-09-22 23:09:16
 * @Description: 
-->
<template>
  <div class="h-toast" v-if="isShow">
    <div class="h-shade"></div>
    <main>
      <img :src="toastIcon" alt="提示图片" />
      <h5>{{ msg }}</h5>
    </main>
  </div>
</template>

<script>
export default {
  name: 'Toast',
  data() {
    return {
      msg: '操作成功',
      type: 'success',
      isShow: false,
      timer: null,
    };
  },
  computed: {
    toastIcon() {
      switch (this.type) {
        case 'success':
          return require('./img/可爱.png');
        case 'error':
          return require('./img/大哭.png');
        case 'warn':
          return require('./img/流汗.png');
        default:
          return require('./img/可爱.png');
      }
    },
  },
  methods: {
    show(msg, type = 'success', time = 500) {
      if (this.timer) {
        this.type = type;
        // 存在定时器则只更改提示和图标
        this.msg = msg;
      } else {
        this.type = type;
        this.msg = msg;
        this.isShow = true;
        // 达到时间后关闭
        this.timer = setTimeout(() => {
          this.isShow = false;
          this.timer = null;
        }, time);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.h-toast {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  .h-shade {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background-color: var(--gray-o5);
  }
  main {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: center;
    align-content: center;
    flex-direction: column;
    background-color: var(--gray-0);
  }
}
</style>

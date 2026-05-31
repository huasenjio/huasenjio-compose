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
  name: "Toast",
  data() {
    return {
      msg: "操作成功",
      type: "success",
      isShow: false,
      timer: null,
    };
  },
  computed: {
    toastIcon() {
      switch (this.type) {
        case "success":
          return require("./img/可爱.png");
        case "error":
          return require("./img/大哭.png");
        case "warn":
          return require("./img/流汗.png");
        default:
          return require("./img/可爱.png");
      }
    },
  },
  methods: {
    show(msg, type = "success", time = 500) {
      if (this.timer) {
        this.type = type;
        this.msg = msg; // 存在定时器则只更改提示和图标
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
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  .h-shade {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }
  main {
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    justify-content: center;
    align-content: center;
    flex-direction: column;
    color: #fff;
    transform: translate(-50%, -50%);
  }
}
</style>

<!--
 * @Autor: huasenjio
 * @Date: 2021-11-06 22:59:45
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-08-30 01:25:47
 * @Description: 
-->
<template>
  <div class="hs-clock">
    <div class="time">
      <span ref="hour" class="hour">{{ hours }}</span>
      <div class="text">时</div>
      <span ref="minute" class="minute">{{ minutes }}</span>
      <div class="text">分</div>
      <span ref="second" class="second">{{ seconds }}</span>
      <div class="text">秒</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HsClock',
  data() {
    return {
      hours: '00',
      minutes: '00',
      seconds: '00',
    };
  },
  mounted() {
    // 组件挂载后执行定时任务每隔一秒执行
    setInterval(this.clock, 1000);
  },
  methods: {
    clock() {
      let h = new Date().getHours();
      let m = new Date().getMinutes();
      let s = new Date().getSeconds();
      // 设置格式
      this.$data.hours = h < 10 ? '0' + h : h;
      this.$data.minutes = m < 10 ? '0' + m : m;
      this.$data.seconds = s < 10 ? '0' + s : s;
    },
  },
};
</script>

<style lang="scss" scoped>
.hs-clock {
  width: 100%;
  height: 100%;
  .time {
    width: 140px;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    span {
      font-size: 20px;
      font-weight: bold;
    }
    .text {
      font-size: 14px;
      margin: 0 3px;
    }
  }
}
</style>

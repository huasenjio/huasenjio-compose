<!--
 * @Autor: huasenjio
 * @Date: 2022-05-06 00:24:01
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-09-14 01:06:02
 * @Description: 
-->
<template>
  <div class="browser-tips-group">
    <div class="title">为了您更好的使用体验 请点击图标升级浏览器</div>
    <a
      v-for="item in tips"
      class="icon"
      target="_blank"
      :href="item.url"
      :class="item.name"
      :key="item.name"
    >
      <div class="img-box w-full"><img class="w-full" :src="item.img" /></div>
      <div class="name-box w-full">{{ item.name }}</div>
    </a>
  </div>
</template>
<script>
export default {
  name: 'BrowserTips',
  data() {
    return {
      tips: [
        {
          name: 'chrome',
          img: require('./img/chrome.png'),
          url: 'https://www.google.com/intl/zh-CN/chrome/',
        },
        {
          name: 'edge',
          img: require('./img/edge.png'),
          url: 'https://www.microsoft.com/zh-cn/edge',
        },
        {
          name: 'safari',
          img: require('./img/safari.png'),
          url: 'https://support.apple.com/zh_CN/downloads/safari',
        },
      ],
    };
  },
};
</script>

<style lang="scss" scoped>
.browser-tips-group {
  position: absolute;
  left: 50%;
  top: 30%;
  width: 375px;
  height: 375px;
  transform: translate(-50%, -30%);
  border-radius: 50px;
  box-shadow: 20px 20px 60px #d9d9d9, -20px -20px 60px #ffffff;
  background-color: var(--gray-0);
  background-image: url('./img/no-support.png');
  background-repeat: no-repeat;
  background-size: 100% auto;
  background-position: center center;
  .title {
    position: absolute;
    bottom: 48px;
    left: 0;
    right: 0;
    text-align: center;
  }
  .icon {
    position: absolute;
    width: 42px;
    height: 42px;
    .img-box {
      width: 100%;
      height: 100%;
      color: var(--gray-600);
      img {
        width: 100%;
        height: 100%;
      }
    }
    .name-box {
      font-size: 12px;
      text-align: center;
      color: var(--gray-600);
    }
  }
  .edge {
    right: 110px;
    top: 78px;
  }
  .chrome {
    right: 42px;
    bottom: 200px;
  }
  .safari {
    top: 174px;
    right: 110px;
  }
  a {
    color: var(--gray-600);
  }
}
</style>

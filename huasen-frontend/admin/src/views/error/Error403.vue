<!--
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-09-30 01:04:52
 * @Description: 
-->
<template>
  <div class="error">
    <div class="main">
      <img src="~@/assets/img/error/403.svg" />
      <h2>无权访问页面</h2>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Error403',
};
</script>
<style lang="scss" scoped>
.error {
  position: relative;
  width: 100%;
  height: 100%;
  .main {
    width: 200px;
    height: 200px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -80%);
    h2 {
      text-align: center;
      margin-top: 30px;
      padding: 5px 10px;
    }
    img {
      width: 200px;
    }
  }
}
</style>

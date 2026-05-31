/*
 * @Autor: huasenjio
 * @Date: 2022-09-25 13:20:40
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-09-30 01:02:10
 * @Description:
 */
export default {
  // 是否登录
  isLogin(state, getters) {
    return !!state.user.token;
  },
  isLoaded(state, getters) {
    return !!state.appConfig.loaded;
  },
};

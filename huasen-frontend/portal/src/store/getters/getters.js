/*
 * @Autor: huasenjio
 * @Date: 2022-09-25 13:20:40
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-09-30 01:02:10
 * @Description:
 */
export default {
  // 可以获得其他的getters
  getUserName(state, getters) {
    return state.user.name;
  },
};

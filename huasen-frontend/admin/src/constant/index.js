/*
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-17 23:13:59
 * @Description:
 */

const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
export default {
  baseWebsocketURL: `${protocol}//${process.env.NODE_ENV === 'development' ? 'localhost:8181' : location.host}/ws/connection`,
  appMinWidth: 1280,
  localManage: '_localManage',
  localAESSecret: '_localAESSecret',
  dictionary: {},
};

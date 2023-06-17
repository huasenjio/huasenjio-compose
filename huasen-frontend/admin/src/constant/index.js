/*
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-17 23:13:59
 * @Description:
 */

export default {
  baseURL: process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:3000/' : '/server/',
  baseWebsocketURL: process.env.NODE_ENV === 'development' ? 'ws://localhost:8181/ws/connection' : `ws://${location.host}/ws/connection`,
  appMinWidth: 1280,
  localManage: 'localManage',
  dictionary: {
    // 权限码
    code: [
      {
        value: 0,
        label: '0-普通用户',
      },
      {
        value: 1,
        label: '1-特权用户',
      },
      {
        value: 2,
        label: '2-管理用户',
      },
      {
        value: 3,
        label: '3-作者权限',
      },
    ],
    // 草稿
    draft: [
      {
        value: true,
        label: '是',
      },
      {
        value: false,
        label: '否',
      },
    ],
    // 是否可用
    enabled: [
      {
        value: true,
        label: '是',
      },
      {
        value: false,
        label: '否',
      },
    ],
  },
};

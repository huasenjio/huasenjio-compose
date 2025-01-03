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
    pin: [
      {
        value: 1,
        label: '热',
      },
      {
        value: 2,
        label: '墙',
      },
      {
        value: 3,
        label: '优',
      },
      {
        value: 4,
        label: '免',
      },
    ],
  },
};

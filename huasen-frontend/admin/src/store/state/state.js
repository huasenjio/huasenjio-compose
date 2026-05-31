/*
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-20 01:11:14
 * @Description:
*/
export default {
  loaded: false,
  // 管理员信息
  manage: {
    id: 'localhost@qq.com',
    token: '',
    code: 0,
  },
  // 是否显示侧边栏
  showWrapLeft: true,

  site: {
    brandName: '花森',
    brandUrl: require('@/assets/img/logo/favicon.svg'),
    redirectUrl: 'https://huasenjio.top/',
  },

  caches: [],
};

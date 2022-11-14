/*
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-11-05 14:55:12
 * @Description: 数据状态树
 */
export default {
  // 用户数据
  user: {
    id: 'localhost@qq.com',
    name: '本地用户',
    headImg: '',
    token: '',
    code: 1,
    records: [],
    config: {
      // 色值｜图片链接| base64
      bg: 'https://s2.loli.net/2022/11/05/IV8GCLlPRWQvrkx.jpg',
      // 背景模糊度 0-10
      bgFilter: 0,
      // 背景明暗0-1（黑）
      bgLightness: 0,
      // 明亮模式
      // lightMode: false,
      // 极简模式
      simpleMode: false,
      // 配色
      theme: {},
    },
  },
  // 展示的栏目
  category: {},
  categorySites: [],
  // 侧栏折叠
  showWrapLeft: true,
  showWrapSidebar: true,
  showWrapSidebarSocket: false,
  showWrapConnect: false,
  showWrapSign: false,
  showWrapPerson: false,
  showForm: false,
  // 系统配置
  appConfig: {
    article: {
      id: '',
      course: '',
      about: '',
      help: '',
    },
  },
};

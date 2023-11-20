/*
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-30 00:42:12
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
      bg: require('@/assets/img/wallpaper/3.jpeg'),
      headerFontColor: '#ffffff',
      // 背景模糊度 0-10
      bgFilter: 0,
      // 背景明暗0-1（黑）
      bgLightness: 0,
      // 明亮模式
      lightMode: false,
      // 极简模式
      simpleMode: false,
      // 配色
      theme: {},
    },
  },
  // 全部站点
  sites: [],
  // 选中订阅源的站点
  categorySites: [],
  // 侧栏折叠
  showWrapLeft: true,
  showWrapSidebar: true,
  showWrapSidebarSocket: false,
  showWrapConnect: false,
  showWrapSign: false,
  showWrapPerson: false,
  showForm: false,

  // 主题配置
  themeConfig: {
    pure: [],
    wallpaper: [],
    defaultWallpaper: {},
  },

  // 系统配置
  appConfig: {
    // 配别配置加载情况
    loaded: false,

    article: {
      id: '',
      course: '',
      about: '',
      help: '',
    },
    site: {
      name: '花森',
      logoURL: require('@/assets/img/logo/favicon.svg'),
      redirectURL: 'http://huasen.cc/',
      guidePageName: '花森小窝',
      guidePageUrl: 'http://huasen.cc/',
      footerHtml: '',
      serviceQRCodeUrl: require('@/assets/img/logo/weixin.png'),
      openLabelClassification: false,
    },
  },
};

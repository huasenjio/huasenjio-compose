/*
 * @Autor: huasenjio
 * @Date: 2022-02-11 00:40:08
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-09-23 00:14:30
 * @Description: 搜索引擎配置
 */
const searchs = [
  {
    url: 'https://www.baidu.com/s',
    key: 'word',
    params: {},
    name: '百度',
    iconClass: 'iconfont icon-baidu',
  },
  {
    url: 'https://www.google.com/search',
    key: 'q',
    params: {},
    name: '谷歌',
    iconClass: 'iconfont icon-chrome',
  },
  {
    url: 'https://cn.bing.com/search',
    key: 'q',
    params: {},
    name: '必应',
    iconClass: 'iconfont icon-bing',
  },
  {
    url: 'localhost',
    key: 'instation',
    params: {},
    name: '站内',
    iconClass: 'iconfont icon-md-planet',
  },
  {
    url: 'https://metaso.cn/',
    key: 'q',
    params: {},
    name: '秘塔',
    iconClass: 'iconfont icon-mita',
  },
  {
    url: 'https://dict.youdao.com/search',
    key: 'q',
    params: {},
    name: '翻译',
    iconClass: 'iconfont icon-translate',
  },
  {
    url: 'https://xueshu.baidu.com/s',
    key: 'wd',
    params: {},
    name: '学术',
    iconClass: 'iconfont icon-md-school',
  },
  {
    url: 'https://ya.ru/images/search',
    key: 'text',
    params: {},
    name: '图搜',
    iconClass: 'iconfont icon-md-image',
  },
  // {
  //   url: 'https://duckduckgo.com/',
  //   key: 'q',
  //   params: {},
  //   name: '匿名',
  //   iconClass: 'iconfont icon-sousuoyinqing',
  // },
  // {
  //   url: 'https://image.baidu.com/search/index',
  //   key: 'word',
  //   params: {
  //     tn: 'baiduimage',
  //   },
  //   name: '百度搜图',
  //   iconClass: 'iconfont icon-md-image',
  //   iconImg: 'https://n.huasenjio.top/img/favicon.57a83e22.svg'
  // },
];
export default searchs;

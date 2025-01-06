/*
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-11-05 10:23:20
 * @Description: 常量/词典
 */

import cityData from '@/config/city.json';

export default {
  // 用户本地缓存句柄
  localUser: '_localUser',
  // 用户本地缓存的对称密钥
  localAESSecret: '_localAESSecret',
  // 公告本地缓存句柄
  appNotice: '_appNotice',
  // 当前订阅源本地缓存句柄
  appJournal: '_appJournal',
  // 根节点最小宽度
  appMinWidth: 435,
  // 根节点最小高度
  appMinHeight: 375,
  // 天气城市信息
  cityData,
  // 词典
  dictionary: {},
};

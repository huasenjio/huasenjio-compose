/*
 * @Autor: huasenjio
 * @Date: 2022-10-01 14:55:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-17 22:51:20
 * @Description: 全局方法注入
 */

const { formatError } = require('../utils/error-handle.js');
const { formatResponseData, responseData } = require('../utils/response-handle');

// 绑定任务代理
const { proxy } = require('../plugin/work-proxy/index.js');

// 挂载全局
global.huasen = {
  formatError,
  formatResponseData,
  responseData,

  // 绑定任务代理
  working: proxy.working.bind(proxy),
};

// 记录状态
global.huasenStatus = {
  // 系统数据
  currentCPU: 0,

  // 汇总数据
  fileCount: 0,
  userCount: 0,
  manageCount: 0,
  articleCount: 0,
  visitorCount: 0,
};

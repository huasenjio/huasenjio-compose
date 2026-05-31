/*
 * @Autor: huasenjio
 * @Date: 2022-10-01 14:55:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-16 21:34:16
 * @Description: 全局方法注入
 */

const _ = require('lodash');
const { formatError } = require('../utils/error-handle.js');
const { formatResponseData, responseData } = require('../utils/response-handle');
const { epWorking, createEpWorking } = require('../service/index.js');
const { generateInstanceFingerprint } = require('../utils/license/fingerprint.js');

let isOfficial = false;
try {
  require('../controller/closed-source/license-center.controller.js');
  isOfficial = true;
} catch (e) {}

// 生成实例指纹（启动时执行一次）
let instanceFingerprint = '';
try {
  instanceFingerprint = generateInstanceFingerprint();
} catch (err) {
  console.error('[Huasen Log]：实例指纹生成失败（Docker Socket / Docker CLI 不可用）:', err.message);
}

// 挂载全局
global.huasen = {
  // 全局处理错误
  formatError,
  // 格式化返回对象
  formatResponseData,
  // 消息回复
  responseData,
  // 任务代理
  createEpWorking,
  // 是否为官方闭源版
  isOfficial,
  // 实例指纹（启动时缓存）
  instanceFingerprint,
};

// 记录状态
global.huasenStatus = {
  // 系统数据
  currentCPU: 0,

  // 数据统计
  fileCount: 0,
  userCount: 0,
  manageCount: 0,
  articleCount: 0,
  visitorCount: 0,
};

global.hsDic = {
  /**
   * 通过Value获取Label
   * @param {String} dic - 字典名称
   * @param {*} value - 值
   */
  getDicLabelByValue(dic, value) {
    let _label;
    (this[dic] || []).forEach(item => {
      if (item.value === value) {
        _label = item.label;
      }
    });
    return _label;
  },

  /**
   * 通过Label获取Value
   * @param {String} dic - 字典名称
   * @param {String} label - 键
   */
  getDicValueByLabel(dic, label) {
    let _value;
    (this[dic] || []).forEach(item => {
      if (item.label === label) {
        _value = item.value;
      }
    });
    return _value;
  },

  code: [
    {
      label: '0-普通用户',
      value: 0,
    },
    {
      label: '1-特权用户',
      value: 1,
    },
    {
      label: '2-管理权限',
      value: 2,
    },
    {
      label: '3-作者权限',
      value: 3,
    },
  ],
  draft: [
    {
      label: '是',
      value: true,
    },
    {
      label: '否',
      value: false,
    },
  ],
};

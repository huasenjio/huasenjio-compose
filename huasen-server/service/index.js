/*
 * @Autor: huasenjio
 * @Date: 2022-07-31 21:55:16
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-21 23:16:57
 * @Description: 任务执行器
 */

const EventProxy = require('eventproxy');

// 任务模版模版
const { findByPage, count, limit, init, upPV } = require('./template.js');
const methodMap = {
  findByPage,
  count,
  limit,
  init,
  upPV,
};

// 表实例
const User = require('../mongodb/model/user.js');
const Record = require('../mongodb/model/record.js');
const Article = require('../mongodb/model/article.js');
const Column = require('../mongodb/model/column.js');
const Site = require('../mongodb/model/site.js');
const Journal = require('../mongodb/model/journal.js');
const schemaMap = {
  User,
  Record,
  Article,
  Column,
  Site,
  Journal,
};

// 生成任务的事件名
function getEventName(work) {
  let { schemaName, methodName } = work;
  return `${schemaName}-${methodName}`;
}

/**
 * 请求对象中任务代理
 * @param {Array}     works         任务
 * @param {Function}  callback      回调函数
 * @param {Object}    config        配置
 * @param {Boolean}   notRequest    是否在请求中使用
 */
function epWorking(works, callback, config = {}, notRequest = false) {
  let ep = notRequest ? config.ep : this.huasenUnit.ep;
  // 遍历代理名
  let eventNames = works.map(work => {
    return getEventName(work);
  });
  // 注册服务代理
  ep.all(...eventNames, callback);
  // 遍历触发任务
  for (let i = 0; i < works.length; i++) {
    let work = works[i];
    let schema = schemaMap[work.schemaName];
    let eventName = getEventName(work);
    let params = work.payloads ? [...work.payloads] : [];
    // 任务分流
    if (work.self) {
      if (typeof methodMap[work.methodName] === 'function') {
        ep._eventName = eventName;
        methodMap[work.methodName](ep, schema, ...params);
      } else {
        console.error(`自建服务模版 ${eventName} 未定义`);
      }
    } else {
      if (typeof schema[work.methodName] === 'function') {
        schema[work.methodName](...params)
          .then(result => {
            ep.emit(eventName, result);
          })
          .catch(err => {
            ep.emit('error', err);
          });
      } else {
        console.error(`schema 服务模版 ${eventName} 未定义`);
      }
    }
  }
}

/**
 * 全局中任务代理
 * @param {Array}     works     代理的任务
 * @param {Function}  callback  代理完成的回调函数
 */
function createEpWorking(works, callback) {
  let ep = EventProxy();
  ep.bind('error', err => {
    // 解绑全部监听
    ep.unbind();
    // 任务代理出错
    global.huasen.formatError(err, '任务代理出错');
  });
  epWorking(works, callback, { ep }, true);
}

module.exports = {
  schemaMap,
  epWorking,
  createEpWorking,
};

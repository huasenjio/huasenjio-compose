/*
 * @Autor: huasenjio
 * @Date: 2022-07-31 21:55:16
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-21 23:16:57
 * @Description: 任务执行器
 */

const path = require('path');
const EventProxy = require('eventproxy');
const mongoose = require('mongoose');
const { flatAsync } = require('huasen-lib');
const { readDirectory } = require('../utils/tool.js');

/**
 * 任务执行器的自建方法映射表
 */
const templates = require('./template.js');
const methodMap = {};
Object.keys(templates).forEach(key => {
  methodMap[key] = templates[key];
});

/**
 * 任务执行器的模型映射表
 */
const schemaMap = {};
const mongodbModelDir = path.resolve(__dirname, '../mongodb/model/');
const files = readDirectory(mongodbModelDir);
files.forEach(file => {
  if (file.endsWith('.js')) {
    try {
      const schema = require(file);
      const modelName = schema.modelName;
      if (schema && modelName) {
        schemaMap[modelName] = schema;
      }
    } catch (e) {
      console.warn(`[Huasen Log]：模型加载跳过（${file}）`);
    }
  }
});

/**
 * 生成任务的事件名
 * @param {*} work
 * @returns
 */
function getEventName(work) {
  let { schemaName, methodName } = work;
  return `${schemaName}-${methodName}`;
}

/**
 * 执行自建服务模版
 * @param {*} ep
 * @param {*} eventName
 * @param {*} fn
 * @param {*} schema
 * @param {*} params
 * @returns
 */
async function runTemplate(ep, eventName, fn, schema, params) {
  const [err, data] = await flatAsync(fn.bind(null, schema, ...params));
  if (err) {
    ep.emit('error', err);
    return;
  }
  ep.emit(eventName, data);
}

/**
 * 任务代理执行器
 */
function epWorking(works, callback, config = {}) {
  const ep = config.ep || this?.huasenUnit?.ep;
  const next = config.next || this?.huasenUnit?.next;
  // 生成事件代理名称
  const eventNames = works.map(work => {
    return getEventName(work);
  });
  // 注册所有事件代理
  ep.all(...eventNames, callback);
  // 监听错误
  ep.bind('error', err => {
    ep.unbind();

    // 全局的错误处理函数
    if (typeof next === 'function') {
      next(err);
    }
  });
  try {
    // 遍历执行所有事件代理
    for (let i = 0; i < works.length; i++) {
      let work = works[i];
      let schema = schemaMap[work.schemaName];
      let eventName = getEventName(work);
      let fn = methodMap[work.methodName];
      let params = work.payloads ? [...work.payloads] : [];

      if (work.self) {
        // 执行自建服务模版
        if (typeof fn === 'function') {
          runTemplate(ep, eventName, fn, schema, params);
        } else {
          ep.emit('error', new Error(`自建服务模版 ${eventName} 未定义`));
        }
      } else {
        // mongodb schema 原生方法
        if (typeof schema[work.methodName] === 'function') {
          schema[work.methodName](...params)
            .then(result => {
              ep.emit(eventName, result);
            })
            .catch(err => {
              ep.emit('error', err);
            });
        } else {
          console.error(`mongodb schema 服务模版 ${eventName} 未定义`);
        }
      }
    }
  } catch (err) {
    ep.emit('error', err);
  }
}

/**
 * 元组任务代理执行器
 * @param {Array} works - 任务数组
 * @param {Object} work - 任务对象
 * @param {String} work.schemaName - 表名，例如：user
 * @param {String} work.methodName - 方法名称，例如：insertOne
 * @param {Array} work.payloads - 参数数组
 * @param {Object} work.payloads[0] - mongodb的doc， 例如：{ _id }
 * @param {Object} work.payloads[1] - mongodb的options，例如：{ session, runValidators: true }
 * @example const [err, data] = await working(works);
 */
async function working(works = [], config = {}) {
  const next = this?.huasenUnit?.next;
  try {
    let promises = [];
    // 遍历执行所有事件代理
    for (let i = 0; i < works.length; i++) {
      let work = works[i];
      let schema = schemaMap[work.schemaName];
      let eventName = getEventName(work);
      let fn = methodMap[work.methodName];
      let params = work.payloads ? [...work.payloads] : [];

      if (work.self) {
        // 执行自建服务模版
        if (typeof fn === 'function') {
          promises.push(fn(schema, ...params));
        } else {
          promises.push(Promise.reject(new Error(`自建服务模版 ${eventName} 未定义`)));
        }
      } else {
        // mongodb schema 原生方法
        if (typeof schema[work.methodName] === 'function') {
          promises.push(schema[work.methodName](...params));
        } else {
          promises.push(Promise.reject(new Error(`mongodb schema 服务模版 ${eventName} 未定义`)));
        }
      }
    }
    const datas = await Promise.all(promises);
    return [null, ...datas];
  } catch (err) {
    // 执行全局错误处理函数
    // if (typeof next === 'function') {
    //   next(err);
    // }
    return [err, null];
  }
}

/**
 * 通过事务批量执行任务，支持insertOne, insertMany, deleteOne, deleteMany, findOne, find, updateOne, updateMany
 * @example const [err, data] = await workingBySeesion(works);
 */
async function workingBySeesion(works = [], config = {}) {
  // 开始事务处理
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // 批量为所有work添加session
    works.forEach(work => {
      if (work.self) return;
      if (['insertOne', 'insertMany', 'deleteOne', 'deleteMany', 'findOne', 'find'].includes(work.methodName)) {
        work.payloads[1] = work.payloads[1] || {};
        work.payloads[1].session = session;
      } else if (['updateOne', 'updateMany'].includes(work.methodName)) {
        work.payloads[2] = work.payloads[2] || {};
        work.payloads[2].session = session;
      }
    });
    // 执行任务
    const [err, ...datas] = await working(works, config);
    if (err) {
      throw err;
    }
    // 提交事务
    await session.commitTransaction();
    session.endSession();
    return [null, ...datas];
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return [err, null];
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
  epWorking(works, callback, { ep });
}

module.exports = {
  schemaMap,
  methodMap,

  epWorking,
  createEpWorking,

  working,
  workingBySeesion,
};

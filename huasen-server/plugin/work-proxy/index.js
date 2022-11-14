/*
 * @Autor: huasenjio
 * @Date: 2022-08-22 00:32:13
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-22 18:18:11
 * @Description: 任务代理
 */

const EventProxy = require('eventproxy');

// 导入数据库表
const User = require('../../mongodb/model/user.js');
const Record = require('../../mongodb/model/record.js');
const Manage = require('../../mongodb/model/manage.js');
const Article = require('../../mongodb/model/article.js');
const Take = require('../../mongodb/model/take.js');

// 导入公告模板库
const { findAllByPage, count, limit, init } = require('./service.js');

class WorkProxy {
  constructor(service, schema) {
    this.schemas = schema || {};
    this.service = service || {};
  }

  working(works, callback, request) {
    let ep = EventProxy();
    let eventNames = works.map(work => {
      return this.getEventName(work);
    });
    // 注册服务代理
    ep.all(...eventNames, callback);
    // 遍历触发异步任务
    works.forEach(work => {
      if (work.self) {
        // 执行自己定义的任务
        let schema = this.schemas[work.schemaName];
        let service = this.service[work.methodName];
        if (!service || !schema) return;
        let params = work.payloads ? [...work.payloads] : [];
        let eventName = this.getEventName(work);
        service(ep, schema, eventName, ...params);
      } else {
        this.sandbox(ep, work);
      }
    });

    // 监听异常
    ep.bind('error', err => {
      // 移除全部监听
      ep.unbind();
      if (request) {
        request.next(err);
      } else {
        // 记录错误日志
        global.huasen.formatError(err, '任务代理执行出错');
      }
    });
  }

  // 沙盒触发运行
  async sandbox(ep, work) {
    try {
      let schema = this.schemas[work.schemaName];
      let params = work.payloads ? [...work.payloads] : [];
      // 请求数据库服务
      let result = await schema[work.methodName](...params);
      ep.emit(this.getEventName(work), result);
    } catch (err) {
      ep.emit('error', err);
    }
  }

  // 解析任务的事件名
  getEventName(work) {
    let { schemaName, methodName } = work;
    return `${schemaName}-${methodName}`;
  }
}

// 代理实例
const proxy = new WorkProxy(
  {
    findAllByPage,
    count,
    limit,
    init,
  },
  {
    User,
    Record,
    Manage,
    Article,
    Take,
  },
);

module.exports = {
  proxy,
};

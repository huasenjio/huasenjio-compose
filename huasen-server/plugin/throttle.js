/*
 * @Autor: huasenjio
 * @Date: 2022-08-18 00:57:27
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-29 00:44:57
 * @Description: 自爆式并发控制器
 */

const EventProxy = require('eventproxy');
const { epWorking } = require('../service/index.js');
const { getUid } = require('../utils/tool.js');

class Throttle {
  constructor(maxCount, queueCount, sleepTime) {
    // 最大处理量，超出数量，进行等待
    this.maxCount = maxCount;
    // 睡眠时间，超出时间自动访问
    this.sleepTime = sleepTime;
    // 等待队列
    this.queue = [];
    // 最大等待数，超出数量，拒绝访问
    this.queueCount = queueCount;
    // 执行集合
    this.executionMap = new Map();
  }

  // 添加进入处理程序
  addRequest(req, res, next) {
    // 生产唯一执行单元信息
    let unit = {
      uid: getUid(16, 8),
      req,
      res,
      next,
    };
    if (this.executionMap.size <= this.maxCount) {
      // 开始处理请求
      this.handleRequest(unit);
    } else if (this.queue.length <= this.queueCount) {
      // 压入等待队列
      this.queue.push(unit);
    } else {
      // 达到最大等待数，拒绝访问
      global.huasen.responseData(res, {}, 'ERROR', '请重新试一试', false);
    }
  }

  handleRequest(unit) {
    let ep = EventProxy();
    ep.bind('error', err => {
      // 移除全部监听
      ep.unbind();
      // 调入全局的错误处理函数
      unit.next(err);
    });
    unit['ep'] = ep;
    // 开始倒计时
    let unitTimer = setTimeout(() => {
      this.deleteRequest(unit);
    }, this.sleepTime);
    // 存入集合
    this.executionMap.set(unit.uid, unitTimer);
    unit.req['epWorking'] = unit.res['epWorking'] = epWorking;
    // 存储单元信息到请求对象
    unit.req['huasenUnit'] = unit.res['huasenUnit'] = ep['huasenUnit'] = unit;
    // 放行请求
    unit.next();
  }

  deleteRequest(unit) {
    if (!unit) return;
    if (unit.res.writableEnded) {
      // 已经正常响应
    } else {
      // 处理超时的请求，手动返回
      global.huasen.responseData(unit.res, {}, 'ERROR', '处理超时', false);
    }
    clearTimeout(this.executionMap[unit.uid]);
    this.executionMap.delete(unit.uid);
    this.executionFirstRequest();
  }

  // 放行处理处于队列第一个的请求
  executionFirstRequest() {
    // 排除等待的请求为零
    if (this.queue.length === 0) return false;
    // 取到队列里的第一个请求
    let unit = this.queue.shift();
    // 存入执行集合内容
    this.handleRequest(unit);
  }

  // 睡眠辅助方法
  sleep(time) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('睡眠结束');
      }, time);
    });
  }
}

// 实例化
const throttle = new Throttle(100, 100, 12000);

module.exports = {
  throttle,
};

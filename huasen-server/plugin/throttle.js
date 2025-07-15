/*
 * @Autor: huasenjio
 * @Date: 2022-08-18 00:57:27
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-29 00:44:57
 * @Description: 自爆式并发控制器
 */

const EventProxy = require('eventproxy');
const { epWorking } = require('../service/index.js');
const { tool } = require('huasen-lib');

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
  addRequest(req, res, next, options = {}) {
    // 生产唯一执行单元信息
    let unit = {
      uid: tool.getUid(16, 8),
      req,
      res,
      next,
      options,
    };
    if (typeof unit.options.addRequestHook === 'function') {
      unit.options.addRequestHook();
    }
    if (this.executionMap.size <= this.maxCount) {
      // 开始处理请求
      this.handleRequest(unit);
    } else if (this.queue.length <= this.queueCount) {
      // 压入等待队列
      this.queue.push(unit);
    } else {
      // 达到最大等待数，拒绝访问
      global.huasen.responseData(res, {}, 'ERROR', '等待人数过多，请重新试一试！');
    }
  }

  handleRequest(unit) {
    if (typeof unit.options.handleRequestHook === 'function') {
      unit.options.handleRequestHook();
    }
    let ep = EventProxy();
    ep.bind('error', err => {
      // 移除全部监听
      ep.unbind();
      // 调入全局的错误处理函数
      unit.next(err);
    });
    // 挂载事件分发器，任务执行器，单元信息到请求对象
    unit['ep'] = ep;
    unit.req['epWorking'] = unit.res['epWorking'] = epWorking;
    unit.req['huasenUnit'] = unit.res['huasenUnit'] = ep['huasenUnit'] = unit;
    // 开始倒计时
    let unitTimer = setTimeout(() => {
      this.deleteRequest(unit);
    }, this.sleepTime);
    // 存入集合
    this.executionMap.set(unit.uid, unitTimer);
    const originalSend = unit.res.send;
    const that = this;
    // 网站send响应数据，因此重写send方法，释放资源，但是send方法会被执行两次，所以需要判断是否已响应
    unit.res.send = function (data) {
      originalSend.call(this, data);
      that.deleteRequest(unit);
    };
    // 放行请求
    unit.next();
  }

  async deleteRequest(unit) {
    if (unit.ended) return;
    const unitTimer = this.executionMap.get(unit.uid);
    clearTimeout(unitTimer);
    // 检查是否已响应
    if (!unit.res.writableEnded) {
      global.huasen.responseData(unit.res, {}, 'ERROR', '已超时，稍后重试！');
      return;
    }
    // 建议删除引用，避免内存泄漏
    this.executionMap.delete(unit.uid);
    delete unit.req['epWorking'];
    delete unit.res['epWorking'];
    if (typeof unit.options.deleteRequestHook === 'function') {
      unit.options.deleteRequestHook();
    }
    // 请求已结束
    unit.ended = true;
    // 处理队列第一个请求
    this.executionFirstRequest();
  }

  // 放行处理处于队列第一个的请求
  executionFirstRequest() {
    // 排除等待的请求为零
    if (this.queue.length === 0) return;
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
const throttle = new Throttle(20, 100, 20000);

module.exports = {
  throttle,
};

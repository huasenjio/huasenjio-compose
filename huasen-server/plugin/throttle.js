/*
 * @Autor: huasenjio
 * @Date: 2022-08-18 00:57:27
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-08 23:46:55
 * @Description: 自爆式并发控制器
 */

const { getUid } = require('../utils/tool.js');

class Throttle {
  constructor(maxCount, queueCount, sleepTime) {
    // 最大处理量
    this.maxCount = maxCount;
    // 最大等待数
    this.queueCount = queueCount;
    // 睡眠时间（自爆时间）
    this.sleepTime = sleepTime;
    // 等待队列
    this.queue = [];
    // 处理的请求集合（进入自曝流程的集合）
    this.executionMap = new Map();
  }

  // 添加进入处理程序
  addRequest(req, res, next) {
    // 生成唯一标识
    let uid = getUid(16, 8);
    // 执行单元
    let unit = {
      uid,
      req,
      res,
      next,
    };
    // 判断等待请求数量是否达到阈值
    if (this.executionMap.size < this.maxCount) {
      // 放行请求
      this.handleRequest(uid, unit);
    } else if (this.queue.length < this.queueCount) {
      // 压入等待队列
      this.queue.push(unit);
    } else {
      // 达到最大等待数
      global.huasen.responseData(res, {}, 'ERROR', '请重新试一试', false);
    }
  }

  // 初始化释放程序，每个请求超过设定时间会自动返回结束，防止请求放行后出错，导致执行集合无法释放资源
  async startReleaseProgram(uid) {
    // 睡眠
    await this.sleep(this.sleepTime);
    // 移除请求实例
    this.removeRequestByUid(uid);
  }

  // 放行处理处于队列第一个的请求
  executionFirstRequest() {
    // 排除等待的请求为零
    if (this.queue.length === 0) return false;
    // 取到队列里的第一个请求
    let data = this.queue.shift();
    // 存入执行集合内容
    this.handleRequest(data.uid, data);
  }

  // 获取正在执行执行队列的请求
  getRequestByUid(uid) {
    return this.executionMap.get(uid);
  }

  // 存入正在处理的集合
  handleRequest(uid, data) {
    // 注入唯一标识
    data.req._hsUid = uid;
    data.res._hsUid = uid;
    data.next();
    // 存入集合
    this.executionMap.set(uid, data);
    // 开始释放流程
    this.startReleaseProgram(data.uid);
  }

  // 移除缓存的请求，并且放行队列中第一个元素
  removeRequestByUid(uid) {
    // 获得请求示例
    let temp = this.getRequestByUid(uid);
    // 排除请求已经正常返回
    if (!temp) return false;
    // 避免请求被重复响应
    if (temp.res.writableEnded) {
      // 正常处理的请求
    } else {
      // 处理超时的请求，手动返回
      global.huasen.responseData(temp.res, {}, 'ERROR', '处理超时', false);
    }
    // 从执行队列中删除
    this.executionMap.delete(uid);
    // 释放正在等待的请求
    this.executionFirstRequest();
  }

  // 请求休眠
  sleep(time) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('睡眠结束');
      }, time);
    });
  }
}

// 实例化
const throttle = new Throttle(10, 100, 30000);

module.exports = {
  throttle,
};

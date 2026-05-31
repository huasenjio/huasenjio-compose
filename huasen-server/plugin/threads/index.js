/*
 * @Autor: huasenjio
 * @Date: 2022-12-03 16:36:38
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-06-11 00:48:05
 * @Description: 调用子线程进行IO密集型任务
 */

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { collectAccessStat } = require('./access-stat.js');

/**
 * 主线程执行回调
 * @param {Object} data 格式 {tag: "调用的方法名"}
 * @returns
 */
const runWorker = data => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, {
      workerData: data,
    });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', code => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
};

if (isMainThread) {
  // 主进程执行代码段
  module.exports = {
    runWorker,
  };
} else {
  // 子进程执行代码段，并且无法共享主进程的状态和变量
  try {
    // 解析传递的参数
    let { access = [] } = workerData || {};
    let result = collectAccessStat(access);
    // 通知主进程传递计算后数据
    parentPort.postMessage(result);
  } catch (err) {
    console.error('子线程运算异常', err);
    parentPort.postMessage({});
  }
}

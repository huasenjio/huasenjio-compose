/*
 * @Autor: huasenjio
 * @Date: 2022-12-03 16:36:38
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-06-11 00:48:05
 * @Description: 调用子线程进行IO密集型任务
 */

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

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
    let result = {};
    // 解析传递的参数
    let { access } = workerData;

    let routerPath = ['/user/', '/manage/', '/article/', '/file/', '/blacklist/', '/take/', '/mail/', '/record/', '/public/webapp/', '/huasen-store/', '/favicon.ico'];

    let traces = [];
    let dubious = [];

    let refererSet = new Set();
    let hostSet = new Set();

    let operateMap = {
      '/manage/login': '后台管理登录动作',
      '/manage/upload': '文件上传动作',
      '/manage/uploadIcon': '图标上传动作',
      '/manage/executeRuntimeCode': '执行脚本动作',
      '/manage/saveAppConfig': '保存配置动作',
      '/manage/remove': '移除管理员动作',
      '/manage/update': '更新管理员动作',

      '/file/remove': '移除文件动作',
      '/file/findAll': '查看全部文件动作',

      '/record/add': '添加日志动作',
      '/record/remove': '删除日志动作',

      '/article/add': '添加文章动作',
      '/article/remove': '移除文章动作',
      '/article/update': '更新文章动作',

      '/user/add': '添加用户动作',
      '/user/remove': '移除用户动作',
      '/user/update': '更新用户动作',

      '/blacklist/remove': '删除黑名单动作',
      '/blacklist/add': '添加黑名单动作',
      '/blacklist/findByPage': '查看黑名单动作',

      '/column/remove': '删除栏目动作',
      '/column/add': '添加栏目动作',

      '/journal/add': '添加订阅动作',
      '/journal/remove': '删除订阅动作',
      '/journal/update': '更新订阅动作',

      '/site/add': '添加网链动作',
      '/site/remove': '删除网链动作',
      '/site/update': '更新网链动作',
    };

    let ipMap = {};

    let userPV = 0;
    let managePV = 0;
    let otherPV = 0;

    access.map(item => {
      let log = JSON.parse(item);
      // 记录PV
      if (log.dot == 'user') {
        userPV++;
      } else if (log.dot == 'manage') {
        managePV++;
      } else {
        otherPV++;
      }
      // 记录UV
      ipMap[log.ip] = ipMap[log.ip] ? ipMap[log.ip] + 1 : 1;
      // 记录referer
      refererSet.add(log.referer);
      // 记录host
      hostSet.add(log.host);
      // 记录可疑请求
      let exit = routerPath.find(path => log.url.includes(path));
      if (!exit) dubious.push(log);
      // 操作记录留痕
      if (operateMap[log.url]) {
        traces.push({
          ...log,
          operateName: operateMap[log.url],
        });
      }
    });

    let referers = Array.from(refererSet);
    let hosts = Array.from(hostSet);

    result = {
      userPV,
      managePV,
      otherPV,

      traces,
      dubious,
      referers,
      hosts,

      ipMap,
    };
    // 通知主进程传递计算后数据
    parentPort.postMessage(result);
  } catch (err) {
    console.error('子线程计算出错', err);
    parentPort.postMessage({});
  }
}

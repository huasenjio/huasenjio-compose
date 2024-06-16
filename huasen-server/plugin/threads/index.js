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
      '/manage/login': '管理员登录',
      '/manage/upload': '文件上传',
      '/manage/uploadIcon': '网站图标上传',
      '/manage/executeRuntimeCode': '执行脚本',
      '/manage/saveAppConfig': '保存配置',
      '/manage/findAppConfig': '查询配置',
      '/manage/remove': '移除管理员',
      '/manage/update': '更新管理员',
      '/manage/add': '添加管理员',
      // '/manage/findByPage': '分页查询管理员',
      // '/manage/overview': '查询数据总览',
      // '/manage/diskOverview': '查询磁盘空间',
      // '/manage/uvOverview': '查询近日访客量',
      // '/manage/visitor': '查询今日访客',
      '/manage/findAppFavicon': ' 爬取网站图标',

      '/mail/getCode': '发送邮箱验证码',

      '/file/remove': '移除文件',
      // '/file/findAll': '查看全部文件',
      // '/file/findAllIcon': '查看全部图标',

      '/record/add': '添加日志',
      '/record/remove': '删除日志',
      // '/record/findByPage': '分页查询日志',
      '/record/removeMany': '批量删除日志',

      '/article/add': '添加文章',
      '/article/remove': '移除文章',
      '/article/update': '更新文章',
      // '/article/findByPage': '分页查询文章',

      '/user/add': '添加用户',
      '/user/remove': '移除用户',
      '/user/update': '更新用户',
      // '/user/findByPage': '分页查询用户',

      '/blacklist/remove': '删除黑名单',
      '/blacklist/add': '添加黑名单',
      // '/blacklist/findByPage': '查看黑名单',

      '/column/remove': '删除栏目',
      '/column/add': '添加栏目',
      // '/column/findByPage': '分页查询栏目',
      '/column/update': '更新栏目',
      // '/column/list': '查询栏目列表',
      // '/column/bindSite': '栏目绑定站点',
      // '/column/unbindSite': '栏目剔除站点',

      '/journal/add': '添加订阅',
      '/journal/remove': '删除订阅',
      '/journal/update': '更新订阅',
      // '/journal/findByPage': '分页查询订阅',

      '/site/add': '添加网链',
      '/site/addMany': '导入网链',
      // '/site/findByPage': '分页查询网链',
      '/site/remove': '删除网链',
      '/site/removeMany': '批量删除网链',
      '/site/update': '更新网链',
      // '/site/list': '查询网链列表',
      // '/site/siteTagList': '查询全部网链标签',
      // '/site/siteColumnList': '查询网链所属栏目',
      // '/site/bindColumn': '网链加入栏目',
      // '/site/unbindColumn': '网链解绑栏目',
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

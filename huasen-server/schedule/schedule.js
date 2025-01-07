/*
 * @Autor: huasenjio
 * @Date: 2022-08-25 22:14:28
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-19 10:40:02
 * @Description: 定时任务
 */
const osUtils = require('os-utils');
const schedule = require('node-schedule');
const path = require('path');
const moment = require('moment');

const { POOL_ACCESS } = require('../config.js');

const { schemaMap } = require('../service/index.js');
const { Record } = schemaMap

const { getUid } = require('../utils/tool.js');

const { delRedisItem } = require('../plugin/ioredis/common.js');
const { getObjectRedisItem } = require('../plugin/ioredis/map.js');

const { readDirectory } = require('../utils/tool.js');

// *  *  *  *  *  *
// ┬  ┬  ┬  ┬  ┬  ┬
// │  │  │  │  │  |
// │  │  │  │  │  └ 星期 --> 其中：0-7 （0 和 7 表示周日）
// │  │  │  │  └─── 月份 --> 取值：1 - 12
// │  │  │  └────── 日期 --> 取值：1 - 31
// │  │  └───────── 时 --> 取值：0 - 23
// │  └──────────── 分 --> 取值：0 - 59
// └─────────────── 秒 --> 取值：0 - 59（可选）

// 每天凌晨3点执行任务，保存当天访问数据入库，并且本地缓存，并且清除收集池
let accessRecordJob = schedule.scheduleJob('0 0 3 * * *', async () => {
  try {
    // 取出缓存当日访问数据的对象
    let log = await getObjectRedisItem(POOL_ACCESS);
    // 组合数据，存入数据库
    let logObject = {
      id: String(getUid(16, 8)),
      time: moment().format('YYYY-MM-DD HH:mm:ss'),
      log: JSON.parse(JSON.stringify(log)),
    };
    await Record.insertMany(logObject);
    await delRedisItem(POOL_ACCESS);
  } catch (err) {
    global.huasen.formatError(err, '日志数据持久化定时任务异常');
  }
});

// 每一分钟更新CPU状态
let accessCPUJob = schedule.scheduleJob('0 * * * * *', async () => {
  try {
    osUtils.cpuUsage(value => {
      // 记录于全局对象上
      global.huasenStatus.currentCPU = value;
    });
  } catch (err) {
    global.huasen.formatError(err, '记录CPU状态定时任务异常');
  }
});

// 每天凌晨记录数据快照
let accessYesterdaySummary = schedule.scheduleJob('0 0 3 * * *', async () => {
  try {
    global.huasen.createEpWorking(
      [
        {
          schemaName: 'User',
          methodName: 'find',
        },
        {
          schemaName: 'Article',
          methodName: 'count',
          self: true,
        },
      ],
      async (users, articleCount) => {
        console.log()
        let userCount = 0, manageCount = 0;
        users.forEach(item => {
          if (item.code >= 2) {
            manageCount++;
          } else {
            userCount++;
          }
        });
        // 记录到全局中
        global.huasenStatus.userCount = userCount;
        global.huasenStatus.manageCount = manageCount;
        global.huasenStatus.articleCount = articleCount;

        let file = readDirectory(path.resolve(process.cwd(), '../huasen-store'));
        global.huasenStatus.fileCount = file.length;
        let visitor = await getObjectRedisItem(POOL_ACCESS);
        global.huasenStatus.visitorCount = Object.values(visitor).length;
        console.log(global.huasenStatus)
      },
    );
  } catch (err) {
    global.huasen.formatError(err, '数据库快照任务异常');
  }
});

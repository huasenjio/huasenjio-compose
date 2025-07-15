/*
 * @Autor: huasenjio
 * @Date: 2022-08-25 22:14:28
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-19 10:40:02
 * @Description: 定时任务
 */

const prettier = require('prettier');
const ejs = require('ejs');
const osUtils = require('os-utils');
const schedule = require('node-schedule');
const path = require('path');
const { get } = require('lodash');
const { tool } = require('huasen-lib');

const setting = require('../setting.json');

const { POOL_ACCESS } = require('../config.js');
const { schemaMap } = require('../service/index.js');
const { Record } = schemaMap;
const { writeToFile } = require('../utils/tool.js');
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
      id: String(tool.getUid(16, 8)),
      time: tool.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
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
let accessYesterdaySummaryJob = schedule.scheduleJob('0 0 3 * * *', async () => {
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
        let userCount = 0;
        let manageCount = 0;
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
        console.log(global.huasenStatus);
      },
    );
  } catch (err) {
    global.huasen.formatError(err, '数据库快照任务异常');
  }
});

// 每小时更新一次SEO数据
let accessSEOJob = schedule.scheduleJob('0 0 * * * *', async () => {
  const code = 0;
  const sitemapPath = path.resolve(__dirname, '../public/webapp/portal/index-seo.html');
  const sitemapTemplatePath = path.resolve(__dirname, '../public/seo/portal.ejs');
  global.huasen.createEpWorking(
    [
      {
        schemaName: 'Site',
        methodName: 'find',
        payloads: [
          {
            // 筛选出小于等于用户权限的订阅源
            code: { $lte: code },
            // 可订阅
            enabled: true,
          },
          {
            name: 1,
            url: 1,
            description: 1,
          },
        ],
      },
      {
        schemaName: 'Article',
        methodName: 'find',
        payloads: [
          {
            // 筛选出小于等于用户权限的文章
            code: { $lte: code },
            // 不是草稿
            isDraft: false,
          },
          {
            manageId: 0,
            code: 0,
            tag: 0,
            bannerImg: 0,
            isDraft: 0,
          },
        ],
      },
    ],
    async (sites, articles) => {
      const origin = get(setting, 'site.origin') || '';
      articles.forEach(item => {
        item.url = `${origin}/#/read/${item._id}`;
      });
      const ejsOpt = {
        brandName: get(setting, 'site.brandName'),
        brandUrl: get(setting, 'site.brandUrl'),
        brandDescription: get(setting, 'site.brandDescription'),
        brandKeywords: get(setting, 'site.brandKeywords'),
        headHtml: get(setting, 'site.headHtml'),
        bodyHtml: get(setting, 'site.bodyHtml'),
        sites,
        articles,
      };
      ejs.renderFile(sitemapTemplatePath, ejsOpt, async (err, html) => {
        if (err) throw err;
        const formatted = await prettier.format(html, { parser: 'html', tabWidth: 2, printWidth: 300 });
        await writeToFile(sitemapPath, formatted);
      });
    },
  );
});

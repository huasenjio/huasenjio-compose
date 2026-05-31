/*
 * @Autor: huasenjio
 * @Date: 2022-10-02 00:26:28
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-06-15 00:41:14
 * @Description: 管理控制器
 */

const path = require('path');
const { tool } = require('huasen-lib');
const checkDiskSpace = require('check-disk-space').default;
const { POOL_ACCESS } = require('../config.js');
const { readDirectory, bytesToSize, handleRate } = require('../utils/tool.js');
const { getObjectRedisItem } = require('../plugin/ioredis/map.js');
const { getAccessRecordCount } = require('../utils/access-memory-store.js');

const VISITOR_REDIS_TIMEOUT = 1500;

const withTimeout = (promise, timeout, fallback) => {
  return Promise.race([
    promise,
    new Promise(resolve => {
      setTimeout(() => resolve(fallback), timeout);
    }),
  ]);
};

function overview(req, res, next) {
  req.epWorking(
    [
      {
        schemaName: 'user',
        methodName: 'find',
      },
      {
        schemaName: 'article',
        methodName: 'count',
        self: true,
      },
    ],
    (users, articleCount) => {
      let userCount = 0;
      let manageCount = 0;
      users.forEach(user => {
        if (user.code >= 2) {
          manageCount++;
        } else {
          userCount++;
        }
      });
      const fileCount = readDirectory(path.resolve(process.cwd(), '../huasen-store')).length;
      global.huasen.responseData(
        res,
        {
          userCount,
          userRate: handleRate(userCount, global.huasenStatus.userCount),
          manageCount,
          manageRate: handleRate(manageCount, global.huasenStatus.manageCount),
          articleCount,
          articleRate: handleRate(articleCount, global.huasenStatus.articleCount),
          fileCount,
          fileRate: handleRate(fileCount, global.huasenStatus.fileCount),
        },
        'SUCCESS',
        '查询总览数据',
      );
    },
  );
}

function diskInfo(req, res, next) {
  const diskPath = '/';
  const target = __dirname.match(/^[a-zA-Z]:/);
  if (target) diskPath = target[0];
  checkDiskSpace(diskPath)
    .then(diskSpace => {
      let disk = {
        diskName: diskPath === '/' ? '根目录' : diskPath,
        freeValue: bytesToSize(diskSpace.free),
        totalValue: bytesToSize(diskSpace.size),
        useValue: bytesToSize(diskSpace.size - diskSpace.free),
        useUsage: Number(((diskSpace.size - diskSpace.free) / diskSpace.size).toFixed(2)),
      };
      global.huasen.responseData(res, disk, 'SUCCESS', '查询磁盘数据');
    })
    .catch(err => {
      next(err);
    });
}

function uvInfo(req, res, next) {
  req.epWorking(
    [
      {
        schemaName: 'record',
        methodName: 'limit',
        payloads: [{ time: -1 }, 5, {}, { __v: 0 }],
        self: true,
      },
    ],
    result => {
      let list = result.map(item => {
        const { _id, id, log } = item;
        return {
          _id,
          id,
          time: tool.formatDate(item.time, 'YYYY/MM/DD'),
          count: log ? Object.keys(log).length : 0,
        };
      });
      global.huasen.responseData(res, list, 'SUCCESS', '查询日志数据');
    },
  );
}

function visitorInfo(req, res, next) {
  const sendVisitorInfo = visitorCount => {
    global.huasen.responseData(
      res,
      {
        visitorCount,
        visitorRate: handleRate(visitorCount, global.huasenStatus.visitorCount),
      },
      'SUCCESS',
      '查询访客数据',
    );
  };

  withTimeout(getObjectRedisItem(POOL_ACCESS), VISITOR_REDIS_TIMEOUT, {})
    .then(async pool => {
      const visitorCount = Math.max(Object.values(pool || {}).length, getAccessRecordCount());
      sendVisitorInfo(visitorCount);
    })
    .catch(err => {
      sendVisitorInfo(getAccessRecordCount());
    });
}

module.exports = {
  overview,
  visitorInfo,
  diskInfo,
  uvInfo,
};

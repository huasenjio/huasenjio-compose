/*
 * @Autor: huasenjio
 * @Date: 2022-08-21 22:10:19
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-12-11 13:41:40
 * @Description: 用户数据统计
 */

const { tool } = require('huasen-lib');
const JWT = require('../../plugin/jwt.js');
const { POOL_ACCESS } = require('../../config.js');
const { getObjectRedisItem } = require('../ioredis/map.js');
const { collectAccessStat } = require('../threads/access-stat.js');
const { getAccessRecords } = require('../../utils/access-memory-store.js');

const VISITOR_REDIS_TIMEOUT = 1500;
const VISITOR_TOKEN_TIMEOUT = 1500;

const withTimeout = (promise, timeout, fallback) => {
  return Promise.race([
    promise,
    new Promise(resolve => {
      setTimeout(() => resolve(fallback), timeout);
    }),
  ]);
};

function getEmptyVisitorInformation() {
  return {
    ...collectAccessStat([]),
    onlines: [],
    time: tool.formatDate(new Date(), 'HH:mm:ss'),
  };
}

async function getVisitorStat() {
  let poolAccess = await withTimeout(getObjectRedisItem(POOL_ACCESS), VISITOR_REDIS_TIMEOUT, {});
  let memoryAccess = getAccessRecords();
  let redisAccess = Object.values(poolAccess || {});
  let access = memoryAccess.length > 0 ? memoryAccess : redisAccess;

  if (access.length === 0) {
    return collectAccessStat([]);
  }

  return collectAccessStat(access);
}

async function getVisitorInformation() {
  try {
    let [result, onlines] = await Promise.all([getVisitorStat(), withTimeout(JWT.getActiveToken(), VISITOR_TOKEN_TIMEOUT, [])]);

    return {
      ...result,
      onlines: Array.isArray(onlines) ? onlines : [],
      time: tool.formatDate(new Date(), 'HH:mm:ss'),
    };
  } catch (err) {
    console.log(err);
    return getEmptyVisitorInformation();
  }
}

module.exports = {
  getEmptyVisitorInformation,
  getVisitorInformation,
};

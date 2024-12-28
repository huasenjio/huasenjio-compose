/*
 * @Autor: huasenjio
 * @Date: 2022-08-21 22:10:19
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-12-11 13:41:40
 * @Description: 用户数据统计
 */

const moment = require('moment');
const JWT = require('../../plugin/jwt.js');
const { POOL_ACCESS } = require('../../config.js');
const { getObjectRedisItem } = require('../ioredis/map.js');
const { runWorker } = require('../threads/index.js');

async function getVisitorInformation() {
  try {
    let poolAccess = await getObjectRedisItem(POOL_ACCESS);
    let onlines = await JWT.getActiveToken();
    let access = Object.values(poolAccess);
    let result = await runWorker({ access });

    return {
      ...result,
      onlines,
      time: moment().format('HH:mm:ss'),
    };
  } catch (err) {
    console.log(err);
    return {};
  }
}

module.exports = {
  getVisitorInformation,
};

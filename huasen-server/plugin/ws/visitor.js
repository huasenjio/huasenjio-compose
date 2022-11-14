/*
 * @Autor: huasenjio
 * @Date: 2022-08-21 22:10:19
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-29 21:00:35
 * @Description: 用户数据统计
 */

const moment = require('moment');
const { POOL_ACCESS } = require('../../config.js');
const { getObjectRedisItem } = require('../ioredis/map.js');
async function getVisitorInformation() {
  try {
    let obj = await getObjectRedisItem(POOL_ACCESS);
    let access = Object.values(obj);
    let adminCount = 0;
    let userCount = 0;
    access.map(item => {
      if (/"url":"\/user\//.test(item)) {
        userCount++;
      } else {
        adminCount++;
      }
    });
    return {
      time: moment().format('HH:mm:ss'),
      userCount,
      adminCount,
    };
  } catch (err) {
    return {};
  }
}

module.exports = {
  getVisitorInformation,
};

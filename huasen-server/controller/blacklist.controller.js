/*
 * @Autor: huasenjio
 * @Date: 2022-10-10 00:36:28
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-16 00:12:17
 * @Description: 文件控制器
 */
const path = require('path');
const {
  getObjectRedisItem,
  setObjectFiledRedisItem,
  delObjectFiledRedisItem,
} = require('../plugin/ioredis/map.js');

const { POOL_BLACKLIST } = require('../config.js');

function findAllByPage(req, res, next) {
  let { pageNo = 1, pageSize = 10, ip = '' } = req.huasenParams;
  getObjectRedisItem(POOL_BLACKLIST).then(pool => {
    let temp = Object.keys(pool).map(key => {
      return {
        ip: pool[key],
      };
    });
    // 模糊过滤
    let filterList = temp.filter(item => {
      return item.ip.includes(ip);
    });
    // 手动分页
    let startIndex = (pageNo - 1) * pageSize;
    let endIndex = pageNo * pageSize;
    let list = filterList.slice(startIndex, endIndex);
    // 数据返回
    global.huasen.responseData(
      res,
      {
        list: list,
        total: filterList.length,
      },
      'SUCCESS',
      '黑名单查询成功',
      false,
    );
  });
}

function remove(req, res, next) {
  let { ip } = req.huasenParams;
  delObjectFiledRedisItem(POOL_BLACKLIST, [ip]).then(result => {
    global.huasen.responseData(res, result, 'SUCCESS', '黑名单移除成功', false);
  });
}

// ip键值对存入缓存
function add(req, res, next) {
  let { ip } = req.huasenParams;
  setObjectFiledRedisItem(POOL_BLACKLIST, ip, ip).then(result => {
    global.huasen.responseData(res, result, 'SUCCESS', '黑名单添加成功', false);
  });
}

module.exports = {
  findAllByPage,
  remove,
  add,
};

const _ = require('lodash');
const { getUid } = require('../utils/tool.js');
const { POOL_ACCESS } = require('../config.js');
const moment = require('moment');
const { getObjectRedisItem, setObjectFiledRedisItem } = require('../plugin/ioredis/map.js');

// 统计日志
const handleRecord = function (data, log = {}) {
  getObjectRedisItem(POOL_ACCESS)
    .then(async () => {
      // 添加 "r"标识，纯数字使用eval函数会有问题
      data.uid = 'r' + getUid(16, 8);
      data.time = moment().format('YYYY-MM-DD HH:mm:ss');
      // 解析参数
      data.payload = _.get(log, 'huasenParams');

      let addThrottleTime = _.get(log, 'huasenUnit.addThrottleTime');
      let handleTime = _.get(log, 'huasenUnit.handleTime');
      let deleteTime = _.get(log, 'huasenUnit.deleteTime');

      // 添加等待时间和处理时间
      if (addThrottleTime && handleTime && deleteTime) {
        data.waitTime = handleTime - addThrottleTime;
        data.responseTime = deleteTime - handleTime;
      }

      // 序列化
      let rawData = JSON.stringify(data);
      await setObjectFiledRedisItem(POOL_ACCESS, data.uid, rawData);
    })
    .catch(err => {
      global.huasen.formatError(err, '记录日志异常');
    });
};

module.exports = {
  handleRecord,
};

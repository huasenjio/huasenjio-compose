const { tool } = require('huasen-lib');
const { POOL_ACCESS } = require('../config.js');
const { getObjectRedisItem, setObjectFiledRedisItem } = require('../plugin/ioredis/map.js');

// 统计日志
const handleRecord = function (data) {
  getObjectRedisItem(POOL_ACCESS)
    .then(async () => {
      // 添加 "r"标识，纯数字使用eval函数会有问题
      data.uid = 'r' + tool.getUid(16, 8);
      data.time = tool.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');
      // 解析参数，剔除管理员登录密码及对称密钥
      if (data.url === '/manage/login') {
        delete data.payload.password;
      }
      delete data.payload._aes_secret;
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

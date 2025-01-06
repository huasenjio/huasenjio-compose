const JWT = require('../plugin/jwt.js');

exports.offlineByKey = async function (response, key) {
  const result = await JWT.destroyTokenByKey(key)
  if (result.tag === 'finish') {
    global.huasen.responseData(response, {}, 'SUCCESS', '已下线');
  } else {
    global.huasen.responseData(response, {}, 'ERROR', '下线异常');
  }
}
/*
 * @Autor: huasenjio
 * @Date: 2021-10-04 19:54:31
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-18 21:28:08
 * @Description: 格式化返回数据工具
 */

const { STATUS, SECRET_RSA_PUBLIC, SECRET_RSA_PRIVATE } = require('../config.js');
const { rsaEncryptLong, encrypt } = require('huasen-lib');

/**
 * 格式化返回数据
 * @param {*} data 
 * @param {*} tag 
 * @param {*} msg 
 */
const formatResponseData = function (data, tag, msg = '响应数据') {
  let format = {
    code: 200,
    msg: `请求成功·${msg}`,
    data,
  };
  switch (tag) {
    case 'SUCCESS':
      format.code = STATUS[tag];
      format.msg = `请求成功·${msg}`;
      break;
    case 'ERROR':
      format.code = STATUS[tag];
      format.msg = `请求失败·${msg}`;
      break;
    case 'FORBIDDEN':
      format.code = STATUS[tag];
      format.msg = `请求禁止·${msg}`;
      break;
    case 'AUTH':
      format.code = STATUS[tag];
      format.msg = `请求无效·${msg}`;
      break;
  }
  return format;
};

/**
 * 统一格式，加密数据，记录日志
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Object} data - 响应数据
 * @param {String} tag - 响应状态
 * @param {String} msg - 响应信息
 * @param {String|null} secret - 加密方式，支持：'aes'、'rsa'、null
 * @example
 * {
 *    code: 200,
 *    msg: '请求成功·响应数据',
 *    data: {} || [] || null || 密文
 * }
 */
function responseData(response, data, tag, msg, secret = null) {
  let formatData = formatResponseData(data, tag, msg, secret);
  let status = formatData.code
  let originData = formatData.data
  if (!response.writableEnded) {
    // 使用客户端传递的对称密钥加密数据，格式：[key, iv]
    const { _aes_secret } = response.huasenParams || {};
    if (secret === 'aes' && Array.isArray(_aes_secret)) {
      originData = encrypt(JSON.stringify(data), _aes_secret)
      response.append('Secret-Method', 'aes');
    } else if (secret === 'rsa') {
      originData = rsaEncryptLong('private', SECRET_RSA_PRIVATE, JSON.stringify(data), 64);
      response.append('Secret-Method', 'rsa');
    }
    formatData.data = originData
    // 请求头中携带公钥到客户端
    response.append('Rsa-Public-Secret', Buffer.from(SECRET_RSA_PUBLIC).toString('base64'));
    // 响应客户端
    response.status(status).send(formatData);
  }
}

module.exports = {
  formatResponseData,
  responseData,
};

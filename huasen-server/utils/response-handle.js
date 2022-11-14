/*
 * @Autor: huasenjio
 * @Date: 2021-10-04 19:54:31
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-08 23:21:59
 * @Description: 格式化返回数据
 */

const { STATUS, SECRET, RSA } = require('../config.js');
const { aesSecret, encrypt } = require('../utils/aes.js');
const { privateEncrypt, rsaPrivateKey, rsaPublicKey, rsaEncryptLong } = require('./rsa.js');
const { throttle } = require('../plugin/throttle.js');

/**
 * 统一格式，加密数据，记录日志
 * @param {Object}  req
 * @param {Object}  res
 * @param {Object}  data
 * @param {String}  tag
 * @param {String}  msg
 * @param {Boolean} isSecret
 * @returns
 */
const formatResponseData = function (data, tag, msg, isSecret) {
  let format = {};
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
    default:
      format.code = 200;
      format.msg = `请求成功·响应数据`;
  }
  // 如果需要加密，序列化后加密传输
  if (isSecret) {
    let rawText = data ? JSON.stringify(data) : data;
    // 非对称加密
    data = rsaEncryptLong('private', rawText, 117);
  }
  format.data = data;
  return format;
};

// 统一进行数据响应返回，_hsHandle表示是否已经处理响应，_hsUid表示请求索引
function responseData(response, data, tag, msg, isSecret) {
  let formatData = formatResponseData(data, tag, msg, isSecret);
  let status = formatData.code;
  if (!response.writableEnded) {
    // 加密情况下响应头携带公钥
    if (isSecret) {
      response.append('Public-Secret', Buffer.from(rsaPublicKey).toString('base64'));
    }
    response.status(status).send(formatData);
    // 通知阀门，释放资源，放行请求
    throttle.removeRequestByUid(response._hsUid);
  }
}

module.exports = {
  formatResponseData,
  responseData,
};

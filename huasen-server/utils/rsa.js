const constants = require('constants');
const crypto = require('crypto');
const CONFIG = require('../config.js');

const rsaPublicKey = CONFIG.SECRET_RSA_PUBLIC;

const rsaPrivateKey = CONFIG.SECRET_RSA_PRIVATE;

/**
 * @description
 * 公钥加密数据
 * @param {*} data 待加密数据
 * @param {*} publicKey 公钥
 * @param {*} inputEncoding 加密数据类型
 * @param {*} outputEncoding 输出的数据类型
 * @param {*} padding 填充方式
 * @returns
 */
function publicEncrypt(data, publicKey, inputEncoding, outputEncoding, padding) {
  const encryptText = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: padding || constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(data, inputEncoding),
  );

  return encryptText.toString(outputEncoding);
}

/**
 * @description
 * 公钥解密数据
 * @param {*} data 待解密数据
 * @param {*} publicKey 公钥
 * @param {*} inputEncoding 解密数据类型
 * @param {*} outputEncoding 输出的数据类型
 * @param {*} padding 填充方式
 * @returns
 */
function publicDecrypt(data, publicKey, inputEncoding, outputEncoding, padding) {
  let decryptText = crypto.publicDecrypt(
    {
      key: publicKey,
      padding: padding || constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(data, inputEncoding),
  );

  return decryptText.toString(outputEncoding);
}

/**
 * @description
 * 私钥加密数据
 * @param {*} data 待加密数据
 * @param {*} privateKey 私钥
 * @param {*} inputEncoding 加密数据类型
 * @param {*} outputEncoding 输出的数据类型
 * @param {*} padding 填充方式
 * @returns
 */
function privateEncrypt(data, privateKey, inputEncoding, outputEncoding, padding) {
  const encryptText = crypto.privateEncrypt(
    {
      key: privateKey,
      padding: padding || constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(data, inputEncoding),
  );

  return encryptText.toString(outputEncoding);
}

/**
 * @description
 * 私钥解密数据
 * @param {*} data 待解密数据
 * @param {*} privateKey 私钥
 * @param {*} inputEncoding 解密数据类型
 * @param {*} outputEncoding 输出的数据类型
 * @param {*} padding 填充方式
 * @returns
 */
function privateDecrypt(data, privateKey, inputEncoding, outputEncoding, padding) {
  const decryptText = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: padding || constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(data, inputEncoding),
  );
  return decryptText.toString(outputEncoding);
}

/**
 * 分段加密数据
 * @param {String} method 加密方式 private ｜ public
 * @param {String} text   加密的字串
 * @param {Number} length 段长（明文 / 2 - 11）
 * @returns
 */
function rsaEncryptLong(method, text, length) {
  let index = 0;
  let preEncryptCells = [];
  while (text[index * length]) {
    let startIndex = index * length;
    let endIndex = (index + 1) * length;
    preEncryptCells.push(text.slice(startIndex, endIndex));
    index++;
  }
  let encryptCell = [];
  for (let i = 0; i < preEncryptCells.length; i++) {
    let s = method === 'public' ? publicEncrypt(preEncryptCells[i], rsaPublicKey, 'utf8', 'hex') : privateEncrypt(preEncryptCells[i], rsaPrivateKey, 'utf8', 'hex');
    encryptCell.push(s);
  }
  return encryptCell.join(':hs:');
}

/**
 * 分段解密数据
 * @param {String} method 解密方式 private ｜ public
 * @param {String} text   需要解密的字串
 * @returns
 */
function rsaDecryptLong(method, text) {
  let preDecriptCells = text.split(':hs:');
  return preDecriptCells.reduce((pre, cur) => {
    let s = method === 'public' ? publicDecrypt(cur, rsaPublicKey, 'hex', 'utf8') : privateDecrypt(cur, rsaPrivateKey, 'hex', 'utf8');
    return pre + s;
  }, '');
}

module.exports = {
  rsaPublicKey,
  rsaPrivateKey,
  publicEncrypt,
  publicDecrypt,
  privateDecrypt,
  privateEncrypt,
  rsaEncryptLong,
  rsaDecryptLong,
};

// 示例
// const str = 'huasen';
// const cipherText = publicEncrypt(str, rsaPublicKey, 'utf8', 'hex'); // 公钥加密
// const decryptText = privateDecrypt(cipherText, rsaPrivateKey, 'hex', 'utf8'); // 私钥解密
// console.log(str === decryptText); // true

// const cipherTextPrivate = privateEncrypt(str, rsaPrivateKey, 'utf8', 'hex'); // 私钥加密
// const decryptTextPublic = publicDecrypt(cipherTextPrivate, rsaPublicKey, 'hex', 'utf8'); // 公钥解密
// console.log(str === decryptTextPublic); // true

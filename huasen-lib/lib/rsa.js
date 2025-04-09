import crypto from 'crypto';
import constants from 'constants';

// 定义默认填充方式
// const DEFAULT_PADDING = constants.RSA_PKCS1_PADDING; // node.js 16及以下
const DEFAULT_PADDING = constants.RSA_PKCS1_OAEP_PADDING // node.js 18及以上

/**
 * 公钥加密数据
 * @param {*} data - 明文
 * @param {*} publicKey - 公钥
 * @param {*} inputEncoding - 加密数据类型
 * @param {*} outputEncoding - 输出的数据类型
 * @param {*} padding - 填充方式
 * @returns
 */
function publicEncrypt(data, publicKey, inputEncoding, outputEncoding, padding) {
  const encryptText = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: padding || DEFAULT_PADDING,
    },
    Buffer.from(data, inputEncoding),
  );

  return encryptText.toString(outputEncoding);
}

/**
 * 公钥解密数据
 * @param {*} data - 密文
 * @param {*} publicKey - 公钥
 * @param {*} inputEncoding - 解密数据类型
 * @param {*} outputEncoding - 输出的数据类型
 * @param {*} padding - 填充方式
 * @returns
 */
function publicDecrypt(data, publicKey, inputEncoding, outputEncoding, padding) {
  let decryptText = crypto.publicDecrypt(
    {
      key: publicKey,
      padding: padding || DEFAULT_PADDING,
    },
    Buffer.from(data, inputEncoding),
  );

  return decryptText.toString(outputEncoding);
}

/**
 * 私钥加密数据
 * @param {*} data - 明文
 * @param {*} privateKey - 私钥
 * @param {*} inputEncoding - 加密数据类型
 * @param {*} outputEncoding - 输出的数据类型
 * @param {*} padding - 填充方式
 * @returns
 */
function privateEncrypt(data, privateKey, inputEncoding, outputEncoding, padding) {
  const encryptText = crypto.privateEncrypt(
    {
      key: privateKey,
      padding: DEFAULT_PADDING,
    },
    Buffer.from(data, inputEncoding),
  );

  return encryptText.toString(outputEncoding);
}

/**
 * 私钥解密数据
 * @param {*} data - 密文
 * @param {*} privateKey - 私钥
 * @param {*} inputEncoding - 解密数据类型
 * @param {*} outputEncoding - 输出的数据类型
 * @param {*} padding - 填充方式
 * @returns
 */
function privateDecrypt(data, privateKey, inputEncoding, outputEncoding, padding) {
  const decryptText = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: DEFAULT_PADDING,
    },
    Buffer.from(data, inputEncoding),
  );
  return decryptText.toString(outputEncoding);
}

/**
 * 分段非对称加密数据
 * @param {String} method - 加密方式，private || public
 * @param {String} secret - 密钥，公钥加密时使用公钥，私钥加密时使用私钥
 * @param {String} text - 明文
 * @param {Number} length 段长（明文 / 2 - 11）
 * @returns
 */
function rsaEncryptLong(method, secret, text, length) {
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
    let s = method === 'public'
      ? publicEncrypt(preEncryptCells[i], secret, 'utf8', 'hex', DEFAULT_PADDING)
      : privateEncrypt(preEncryptCells[i], secret, 'utf8', 'hex', DEFAULT_PADDING);
    encryptCell.push(s);
  }
  return encryptCell.join(':hs:');
}

/**
 * 分段非对称解密数据
 * @param {String} method - 解密方式，private || public
 * @param {String} secret - 密钥，私钥加密时使用公钥解密，公钥加密时使用私钥解密
 * @param {String} text - 密文
 * @returns
 */
function rsaDecryptLong(method, secret, text) {
  let preDecriptCells = text.split(':hs:');
  return preDecriptCells.reduce((pre, cur) => {
    let s = method === 'public'
      ? publicDecrypt(cur, secret, 'hex', 'utf8', DEFAULT_PADDING)
      : privateDecrypt(cur, secret, 'hex', 'utf8', DEFAULT_PADDING);
    return pre + s;
  }, '');
}

export {
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

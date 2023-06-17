/*
 * @Autor: huasenjio
 * @Date: 2022-07-31 21:55:16
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-02-04 16:27:21
 * @Description: 对称加密
 */
const crypto = require('crypto');

const CONFIG = require('../config.js');

// const key = "dj38Ca8F8hac23nD"; // 16位共享值
// const iv = "k4h9HdcXmEr83nsF"; // 初始偏移量

// 对称加密密钥
const aesSecret = CONFIG.SECRET_AES;

/**
 * 解密
 * @param dataStr {String}  加密内容
 * @param dataStr {Array}   加密密钥
 * @return {string}
 */
function decrypt(dataStr, secrets) {
  secrets = secrets || aesSecret;
  let cipherChunks = [];
  let decipher = crypto.createDecipheriv('aes-128-cbc', secrets[0], secrets[1]);
  decipher.setAutoPadding(true);
  cipherChunks.push(decipher.update(dataStr, 'base64', 'utf8'));
  cipherChunks.push(decipher.final('utf8'));
  return cipherChunks.join('');
}

/**
 * 加密
 * @param dataStr {String}  加密内容
 * @param dataStr {Array}   加密密钥
 * @return {string}
 */
function encrypt(dataStr, secrets) {
  secrets = secrets || aesSecret;
  let cipherChunks = [];
  let cipher = crypto.createCipheriv('aes-128-cbc', secrets[0], secrets[1]);
  cipher.setAutoPadding(true);
  cipherChunks.push(cipher.update(dataStr, 'utf8', 'base64'));
  cipherChunks.push(cipher.final('base64'));
  return cipherChunks.join('');
}

module.exports = {
  decrypt,
  encrypt,
  aesSecret,
};

/*
 * @Autor: huasenjio
 * @Date: 2022-07-31 21:55:16
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-02-04 16:27:21
 * @Description: 对称加密方法
 */
import crypto from 'crypto';

// const key = "dj38Ca8F8hac23nD"; // 16位共享值
// const iv = "k4h9HdcXmEr83nsF"; // 初始偏移量

/**
 * 随机生成0-9a-zA-Z字符串
 * @returns {string} - 随机字符串
 */
function generateRandomString() {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < 16; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * 随机生成aes密钥
 * @returns {Array} - aes密钥
 */
function getAESSecret() {
  return [generateRandomString(), generateRandomString()];
}


/**
 * 对称解密
 * @param {String} dataStr - 密文
 * @param {Array} secrets - 加密密钥，例如：[key，iv]
 * @return {String} 明文
 */
function decrypt(dataStr, secrets) {
  secrets = secrets;
  let cipherChunks = [];
  let decipher = crypto.createDecipheriv('aes-128-cbc', secrets[0], secrets[1]);
  decipher.setAutoPadding(true);
  cipherChunks.push(decipher.update(dataStr, 'base64', 'utf8'));
  cipherChunks.push(decipher.final('utf8'));
  return cipherChunks.join('');
}

/**
 * 对称加密
 * @param {String} dataStr - 明文
 * @param {Array} secrets - 加密密钥，例如：[key，iv]
 * @return {String} 密文
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

export {
  getAESSecret,
  decrypt,
  encrypt,
};

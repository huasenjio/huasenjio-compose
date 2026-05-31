import crypto from "crypto";

/**
 * 公钥加密数据
 * @param {*} data - 明文
 * @param {*} publicKey - 公钥
 * @returns
 */
function publicEncrypt(data, publicKey) {
  try {
    const buffer = Buffer.from(data, "utf8");
    const encrypted = crypto.publicEncrypt(publicKey, buffer);
    return encrypted.toString("base64");
  } catch (err) {
    throw new Error(`公钥加密失败：${err.message}`);
  }
}

/**
 * 公钥解密数据
 * @param {*} data - 密文
 * @param {*} publicKey - 公钥
 * @returns
 */
function publicDecrypt(data, publicKey) {
  try {
    const buffer = Buffer.from(data, "base64");
    let decryptText = crypto.publicDecrypt(publicKey, buffer);
    return decryptText.toString("utf8");
  } catch (err) {
    throw new Error(`公钥解密失败：${err.message}`);
  }
}

/**
 * 私钥加密数据
 * @param {*} data - 明文
 * @param {*} privateKey - 私钥
 * @returns
 */
function privateEncrypt(data, privateKey) {
  try {
    const buffer = Buffer.from(data, "utf8");
    const encrypted = crypto.privateEncrypt(privateKey, buffer);
    return encrypted.toString("base64");
  } catch (err) {
    throw new Error(`私钥加密失败：${err.message}`);
  }
}

/**
 * 私钥解密数据
 * @param {*} data - 密文
 * @param {*} privateKey - 私钥
 * @returns
 */
function privateDecrypt(data, privateKey) {
  try {
    const buffer = Buffer.from(data, "base64");
    const decrypted = crypto.privateDecrypt(privateKey, buffer);
    return decrypted.toString("utf8");
  } catch (err) {
    throw new Error(`私钥解密失败：${err.message}`);
  }
}

/**
 * 分段非对称加密数据
 * @param {String} method - 加密方式，private || public
 * @param {String} secret - 密钥，公钥加密时使用公钥，私钥加密时使用私钥
 * @param {String} text - 明文
 * @param {Number} length - 段长（明文 / 2 - 11）
 * @returns
 */
function rsaEncryptLong(method, secret, text, length = 110) {
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
    let s =
      method === "public"
        ? publicEncrypt(preEncryptCells[i], secret)
        : privateEncrypt(preEncryptCells[i], secret);
    encryptCell.push(s);
  }
  return encryptCell.join(":@:hs:@:");
}

/**
 * 分段非对称解密数据
 * @param {String} method - 解密方式，private || public
 * @param {String} secret - 密钥，私钥加密时使用公钥解密，公钥加密时使用私钥解密
 * @param {String} text - 密文
 * @returns
 */
function rsaDecryptLong(method, secret, text) {
  let preDecriptCells = text.split(":@:hs:@:");
  return preDecriptCells.reduce((pre, cur) => {
    let s =
      method === "public"
        ? publicDecrypt(cur, secret)
        : privateDecrypt(cur, secret);
    return pre + s;
  }, "");
}

export {
  publicEncrypt,
  publicDecrypt,
  privateDecrypt,
  privateEncrypt,
  rsaEncryptLong,
  rsaDecryptLong,
};

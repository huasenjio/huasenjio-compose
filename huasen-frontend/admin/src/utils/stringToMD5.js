const crypto = require("crypto");

/**
 * md5简单加密
 * @param {String} text 脱敏的字符串
 * @returns String
 */
export function stringToMD5(text) {
  const md5 = crypto.createHash("md5");
  return md5.update(text).digest("hex");
}
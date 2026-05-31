/*
 * @Autor: huasenjio
 * @Date: 2026-04-01 00:00:00
 * @LastEditors: huasenjio
 * @LastEditTime: 2026-04-01 00:00:00
 * @Description: 图片验证码系统
 */
const svgCaptcha = require('svg-captcha');
const { POOL_CAPTCHA } = require('../config.js');
const { setRedisItem, getRedisItem, delRedisItem } = require('../plugin/ioredis/common.js');

class Captcha {
  constructor() {
    this.expire = 300; // 验证码生存时间（秒）
  }

  /**
   * 生成图片验证码，token 作为验证码的唯一标识存入 Redis
   * @returns {Promise<{ token: String, svg: String }>}
   */
  create() {
    const captcha = svgCaptcha.create({
      width: 120,
      height: 40,
      size: 4,
      noise: 1,
      color: true,
      background: '#fff',
    });
    // 以随机 token 为 key，验证码文本（忽略大小写）为 value 存入 Redis
    const token = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    return setRedisItem(this.getRedisKey(token), captcha.text.toLowerCase(), this.expire).then(() => {
      return { token, svg: captcha.data };
    });
  }

  /**
   * 校验验证码
   * @param {String} token 验证码标识
   * @param {String} text  用户输入
   */
  verify(token, text) {
    return getRedisItem(this.getRedisKey(token)).then(code => {
      return code && code === text.toLowerCase();
    });
  }

  /**
   * 删除验证码，验证通过后销毁，防止重放
   * @param {String} token
   */
  remove(token) {
    return delRedisItem(this.getRedisKey(token));
  }

  getRedisKey(token) {
    return `${POOL_CAPTCHA}_${token}`;
  }
}

module.exports = new Captcha();

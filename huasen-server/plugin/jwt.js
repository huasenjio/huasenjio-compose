/*
 * @Autor: huasenjio
 * @Date: 2021-10-04 15:09:29
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-20 00:47:45
 * @Description: 基于redis的token管理器
 */

// 引入JWT模块
const jwt = require('jsonwebtoken');
const { JWT, POOL_TOKEN } = require('../config.js');
const { setRedisItem, getRedisItem, delRedisItem, getRedisKeys, getRedisKeyTTL, getRedisValuesByKeys } = require('../plugin/ioredis/common.js');

class Jwter {
  constructor() {
    this.expire = JWT.expiresIn; // token生存时间
  }

  /**
   * 注册token，重复生成仅仅会覆盖token，不会延长token的生存时间
   * @param   {String}  key - 存入redis的键，此处为用户、管理员账号，即：邮箱地址
   * @param   {Object}  payload - 必须包含id属性，载荷信息存入token
   * @returns {String}  token - 生成的token
   */
  createToken(key, payload = {}) {
    return new Promise((resolve, reject) => {
      let token = jwt.sign(payload, JWT.screat);
      setRedisItem(this.getTokenRedisKey(key), token, this.expire)
        .then(status => {
          resolve(token);
        })
        .catch(err => {
          reject(this.handle('error'));
        });
    });
  }

  /**
   * 校验token合法性
   * @param {Sting} token - 待校验的token
   * @returns
   */
  verifyToken(token) {
    return new Promise((resolve, reject) => {
      // 1.校验token合法性
      // 2.判断token是否过期
      // 3.成功解析后延长token生存时间
      jwt.verify(token, JWT.screat, (err, data) => {
        if (!err) {
          // token合法
          let key = data.key;
          // 若token已过期，则返回null，未过期则重置生存时间
          getRedisItem(this.getTokenRedisKey(key), this.expire)
            .then(token => {
              if (token) {
                // 正常
                resolve(this.handleMsg('pass', data));
              } else {
                // 过期
                reject(this.handleMsg('timeout'));
              }
            })
            .catch(err => {
              // 错误
              reject(this.handleMsg('error'));
            });
        } else {
          // 不合法，校验不通过
          reject(this.handleMsg('illegal'));
        }
      });
    });
  }

  /**
   * 获取所有活跃token
   * @returns 
   */
  async getActiveToken() {
    try {
      let onlines = []
      const keys = await getRedisKeys(`${POOL_TOKEN}_*`)
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const token = await getRedisItem(key)
        const ttl = await getRedisKeyTTL(key)
        onlines.push({
          id: this.getKey(key),
          token: token,
          ttl
        })
      }
      return onlines
    } catch (err) {
      return
    }
  }

  /**
   * 销毁token
   * @param {string} key - 存入redis的键，此处为用户、管理员账号，即：邮箱地址
   * @returns
   */
  async destroyTokenByKey(key) {
    try {
      const redisKey = this.getTokenRedisKey(key);
      const token = await getRedisItem(redisKey);
      if (token) {
        await delRedisItem(redisKey)
        return this.handleMsg('finish', null)
      }
      return this.handleMsg('notfound', null)
    } catch (err) {
      this.handleMsg('error', null)
    }
  }


  /**
   * 统一处理通知
   * @param {Object} tag - 标志
   * @param {Object} data - 解析的数据
   * @returns Object
   */
  handleMsg(tag, data) {
    let notify = {};
    switch (tag) {
      case 'pass':
        notify.msg = '身份校验通过';
        break;
      case 'timeout':
        notify.msg = '身份已过期，请重新登录！';
        break;
      case 'illegal':
        notify.msg = '身份非法，劝您善良！';
        break;
      case 'lack':
        notify.msg = '身份参数缺失，请您登录账号！';
        break;
      case 'notfound':
        notify.msg = '身份未知，劝您善良！';
        break;
      case 'finish':
        notify.msg = '操作完成';
        break;
      default:
        notify.msg = '未知异常';
        break;
    }
    notify.tag = tag;
    notify.data = data;
    return notify;
  }

  /**
   * 获取jwt存储于redis的key值
   * @param {string} key - 存入redis的键，此处为用户、管理员账号，即：邮箱地址
   * @returns 
   */
  getTokenRedisKey(key) {
    return `${POOL_TOKEN}_${key}`;
  }

  /**
   * 获取key
   * @param {string} redisKey - redis的key值
   * @returns 
   */
  getKey(redisKey) {
    return redisKey.split(`${POOL_TOKEN}_`)[1]
  }
}

module.exports = new Jwter();

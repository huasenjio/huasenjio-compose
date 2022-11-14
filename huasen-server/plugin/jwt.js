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
const { setRedisItem, getRedisItem } = require('../plugin/ioredis/common.js');

class Jwter {
  constructor() {
    this.expire = JWT.expiresIn; // token生存时间
  }

  /**
   * 注册token，重复生成仅仅会覆盖token，不会延长token的生存时间
   * @param   {String}  key     存入redis的键
   * @param   {Object}  payload 包含id的参数
   * @returns {String}  token   生成的token
   */
  createToken(key, payload = {}) {
    return new Promise((resolve, reject) => {
      let token = jwt.sign(payload, JWT.screat);
      setRedisItem(this.getTokenRedisKey(key), token, this.expire)
        .then(status => {
          resolve(token);
        })
        .catch(err => {
          reject(this.handleError('error'));
        });
    });
  }

  /**
   * 校验token合法性
   * @param {Sting} token
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
                resolve(this.handleError('success', data));
              } else {
                // 过期
                reject(this.handleError('timeout'));
              }
            })
            .catch(err => {
              // 错误
              reject(this.handleError('error'));
            });
        } else {
          // 不合法，校验不通过
          reject(this.handleError('illegal'));
        }
      });
    });
  }

  /**
   * 统一处理通知
   * @param {Object} tag  通知标志
   * @param {Object} data 解析的数据
   * @returns Object
   */
  handleError(tag, data) {
    let notify = {};
    switch (tag) {
      case 'success':
        notify.msg = '身份校验通过';
        break;
      case 'timeout':
        notify.msg = '身份已过期';
        break;
      case 'illegal':
        notify.msg = '身份非法';
        break;
      case 'error':
        notify.msg = '身份校验容器异常';
        break;
      case 'lack':
        notify.msg = '身份参数缺失';
        break;
      default:
        notify.msg = '身份校验错误';
        break;
    }
    notify.tag = tag;
    notify.data = data;
    return notify;
  }

  // 获取邮箱存储于redis里面的key值
  getTokenRedisKey(key) {
    return `${POOL_TOKEN}_${key}`;
  }
}

module.exports = new Jwter();

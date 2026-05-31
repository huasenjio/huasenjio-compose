/*
 * @Autor: huasenjio
 * @Date: 2022-08-21 16:50:21
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-08-21 19:40:18
 * @Description: 通用的操作方法
 */
const { ioRedisClient } = require('./index.js')

/**
 * 封装拓展redis的set方法
 * @param {String}  key     键
 * @param {}        value   值（对象｜字符串）
 * @param {Number}  expire  过期时间（60 = 60秒）
 */
function setRedisItem(key, value, expire) {
  return new Promise((resolve, reject) => {
    // 异常排除
    if (!key || typeof key !== "string") reject()
    if (value === undefined || value === null) reject()

    // 如果是字符串或整数则直接存储，其他类型转为JSON字符串后存储
    let val = typeof value == "string" || typeof value == "number" ? value : JSON.stringify(value)
    ioRedisClient.set(key, val).then(stat => {
      if (expire && Number.isInteger(expire)) {
        // 重置过期时间
        ioRedisClient.expire(key, expire)
      }
      resolve(stat)
    }).catch(err => {
      reject(err)
    })
  })
}

/**
 * 封装拓展redis的get方法
 * @param {String} key    键
 * @param {String} expire 更新生存时间
 */
function getRedisItem(key, expire) {
  return new Promise((resolve, reject) => {
    if (!key || typeof key !== "string") reject()
    ioRedisClient.get(key).then(value => {
      try {
        resolve(JSON.parse(value))
      } catch (err) {
        // JSON无法解析报错，直接返回
        resolve(value)
      } finally {
        if (value && expire && Number.isInteger(expire)) {
          // 更新生存时间，令牌保活
          ioRedisClient.expire(key, expire)
        }
      }
    }).catch(err => {
      reject(err)
    })
  })
}

/**
 * 删除键值对
 * @param {String} key 
 * @returns
 */
function delRedisItem(key) {
  return new Promise((resolve, reject) => {
    if (!key) reject()
    ioRedisClient.del(key).then(delCount => {
      resolve(delCount)
    }).catch(err => {
      reject(err)
    })
  })
}

/**
 * 模糊查询键值对
 * @param {string} pattern - 模糊查询规则，例如：“ * ”匹配所有，“user*”匹配user开头的键
 * @returns {array} - 命中key列表
 */
function getRedisKeys(pattern) {
  pattern = pattern || '*'
  return new Promise((resolve, reject) => {
    ioRedisClient.keys(pattern).then(keys => {
      resolve(keys)
    }).catch(err => {
      reject(err)
    })
  })
}

/**
 * 获取键的生存时间
 * @param {string} key - 键
 * @returns {number} - 生存时间，单位秒，-1表示永不过期，-2表示不存在
 */
function getRedisKeyTTL(key) {
  return new Promise((resolve, reject) => {
    ioRedisClient.ttl(key).then(ttl => {
      resolve(ttl)
    }).catch(err => {
      reject(err)
    })
  })
}

/**
 * 批量获取键值对
 * @param {array} keys - 键列表
 * @returns 
 */
function getRedisValuesByKeys(keys = []) {
  return new Promise((resolve, reject) => {
    ioRedisClient.mget(keys).then(values => {
      resolve(values)
    }).catch(err => {
      reject(err)
    })
  })
}

module.exports = {
  delRedisItem,
  setRedisItem,
  getRedisItem,
  getRedisKeys,
  getRedisKeyTTL,
  getRedisValuesByKeys
}
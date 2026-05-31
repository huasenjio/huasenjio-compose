/*
 * @Autor: huasenjio
 * @Date: 2022-08-21 16:27:11
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-08-21 17:09:59
 * @Description: String结构键值对
 */
const { ioRedisClient } = require('./index.js')

/**
 * 存储字符串类型的键值对
 * @param {String} key      key值
 * @param {String} value    value值
 * @param {Number} expire   过期时间（60 = 60秒）
 * @returns
 */
function setStringRedisItem(key, value, expire) {
  return new Promise((resolve, reject) => {
    // 异常判断
    if (!key || typeof key !== 'string') reject()
    if (value === undefined || value === null) reject()

    ioRedisClient.set(key, value)
      .then(result => {
        if (expire && Number.isInteger(expire)) {
          // 设置过期时间，否则永久存储
          ioRedisClient.expire(key, expire)
        }
        // 存入成功，返回'ok'
        resolve(result)
      }).catch(err => {
        reject(err)
      })
  })
}

/**
 * 查取字符串类型的键值对
 * @param {String} key    存入的key值
 * @param {Number} expire 过期时间（60 = 60秒）
 * @returns
 */
function getStringRedisItem(key, expire) {
  return new Promise((resolve, reject) => {
    if (!key || typeof key !== 'string') reject()
    ioRedisClient.get(key).then(value => {
      if (expire && Number.isInteger(expire)) {
        // 重置过期时间
        ioRedisClient.expire(key, expire)
      }
      // key ? value : null
      resolve(value)
    }).catch(err => {
      reject(err)
    })
  })
}

module.exports = {
  setStringRedisItem,
  getStringRedisItem
}
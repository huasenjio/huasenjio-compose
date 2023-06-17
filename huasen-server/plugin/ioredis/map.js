/*
 * @Autor: huasenjio
 * @Date: 2022-08-21 16:27:20
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-08-21 22:14:46
 * @Description: Map结构键值对
 */
const { ioRedisClient } = require('./index.js')

/**
 * 存储对象类型的键值对
 * @param {String} key    存入的key值    
 * @param {Object} obj    非空对象     
 * @param {Number} expire 过期时间（60 = 60秒）
 * @returns
 */
function setObjectRedisItem(key, obj, expire) {
  return new Promise((resolve, reject) => {
    if (!key || typeof key !== 'string') reject()
    if (!obj || typeof obj !== 'object' || Array.isArray(obj) || Object.keys(obj).length === 0) reject()

    ioRedisClient.hmset(key, obj).then(stat => {
      if (expire && Number.isInteger(expire)) {
        // 设置过期时间
        ioRedisClient.expire(key, expire)
      }
      resolve(stat)
    }).catch(err => {
      reject(err)
    })
  })
}

/**
 * 查取对象类型的键值对
 * @param {String} key    存入的key值        
 * @param {Number} expire 过期时间（60 = 60秒）
 * @returns
 */
function getObjectRedisItem(key, expire) {
  return new Promise((resolve, reject) => {
    if (!key || typeof key !== 'string') reject()
    ioRedisClient.hgetall(key).then(obj => {
      if (expire && Number.isInteger(expire)) {
        // 重置过期时间
        ioRedisClient.expire(key, expire)
      }
      resolve(obj)
    }).catch(err => {
      reject(err)
    })
  })
}

/**
 * 设置/更改对象类型的属性
 * @param {String} key        key值 
 * @param {String} filedKey   修改的字段
 * @param {String} value      值（字符串）
 * @param {Number} expire     过期时间（60 = 60秒）
 * @returns
 */
function setObjectFiledRedisItem(key, filedKey, value, expire) {
  return new Promise((resolve, reject) => {
    if (!key || typeof key !== 'string') reject()
    if (!filedKey || typeof filedKey !== 'string') reject()
    if (value === undefined || value === null) reject()

    ioRedisClient.hmset(key, filedKey, value).then(stat => {
      if (expire && Number.isInteger(expire)) {
        ioRedisClient.expire(key, expire)
      }
      resolve(stat)
    }).catch(err => {
      reject(err)
    })
  })
}

/**
 * 移除对象类型的属性
 * @param {String}  key         key值 
 * @param {Array}   filedKeys   移除的字段集合
 * @param {Number}  expire      过期时间（60 = 60秒）
 * @returns
 */
function delObjectFiledRedisItem(key, filedKeys, expire) {
  return new Promise((resolve, reject) => {
    if (!key || typeof key !== 'string') reject()
    if (!Array.isArray(filedKeys)) reject()

    ioRedisClient.hdel(key, filedKeys).then(obj => {
      if (expire && Number.isInteger(expire)) {
        ioRedisClient.expire(key, expire)
      }
      resolve(obj)
    }).catch(err => {
      reject(err)
    })
  })
}

/**
 * 查取对象类型的属性
 * @param {String} key 
 * @param {String} filedKey 
 * @param {Number} expire
 * @returns 
 */
function getObjectFiledRedisItem(key, filedKey, expire) {
  return new Promise((resolve, reject) => {
    if (!key || typeof key !== 'string') reject()
    if (!filedKey || typeof filedKey !== 'string') reject()

    ioRedisClient.hgetall(key, filedKey).then(value => {
      if (expire && Number.isInteger(expire)) {
        ioRedisClient.expire(key, expire)
      }
      resolve(value)
    }).catch(err => {
      reject(err)
    })
  })
}

/**
 * 查取对象类型的属性
 * @param {String} key 
 * @param {String} filedKey 
 * @param {Number} expire
 * @returns 
 */
function isExistObjectFiledRedisItem(key, filedKey, expire) {
  return new Promise((resolve, reject) => {
    if (!key || typeof key !== 'string') reject()
    if (!filedKey || typeof filedKey !== 'string') reject()

    ioRedisClient.hexists(key, filedKey).then(tag => {
      resolve(tag) // 1存在 || 0不存在
    }).catch(err => {
      reject(err)
    })
  })
}


module.exports = {
  setObjectRedisItem,
  getObjectRedisItem,
  setObjectFiledRedisItem,
  getObjectFiledRedisItem,
  delObjectFiledRedisItem,
  isExistObjectFiledRedisItem
}
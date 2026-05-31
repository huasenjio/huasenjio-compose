/*
 * @Autor: huasenjio
 * @Date: 2022-08-21 16:27:26
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-08-21 17:30:00
 * @Description: list结构键值对
 */
const { ioRedisClient } = require('./index.js')

/**
 * 追加存储数组类型的键值对
 * @param {String}  key    存入的key值    
 * @param {Array}   arr    非空集合    
 * @param {Number}  expire 过期时间（60 = 60秒）
 * @returns
 */
function setArrayRedisItem(key, arr, expire) {
  return new Promise((resolve, reject) => {
    if (!key || typeof key !== 'string') reject()
    if (!Array.isArray(arr)) reject()

    // let arr = [1(索引：4), 3, 5, 7, 9（索引：0）]
    ioRedisClient.lpush(key, arr).then(addCount => {
      if (expire && Number.isInteger(expire)) {
        // 设置过期时间
        ioRedisClient.expire(key, expire)
      }
      resolve(addCount)
    }).catch(err => {
      reject(err)
    })
  })
}

/**
 * 根据范围查取数组类型的键值对
 * @param {String}  key         存入的key值    
 * @param {Number}  startIndex  开始下标   
 * @param {Number}  endIndex    开始下标   
 * @param {Number}  expire      过期时间（60 = 60秒）
 * @returns
 */
function getArrayRedisItemByRange(key, startIndex, endIndex, expire) {
  return new Promise((resolve, reject) => {
    if (!key || typeof key !== 'string') reject()
    if (!Number.isInteger(startIndex) || !Number.isInteger(endIndex)) reject()

    // 全部 => 0,-1
    ioRedisClient.lrange(key, startIndex, endIndex).then(arr => {
      if (expire && Number.isInteger(expire)) {
        // 设置过期时间
        ioRedisClient.expire(key, expire)
      }
      // key ? value : []
      resolve(arr)
    }).catch(err => {
      reject(err)
    })
  })
}

/**
 * 弹出数组类型的键值对下标为零的元素，改变存入的数组
 * @param {String}  key     存入的key值
 * @param {Number}  expire  过期时间（60 = 60秒）
 * @returns
 */
function popArrayRedisItemByRange(key, expire) {
  return new Promise((resolve, reject) => {
    if (!key || typeof key !== 'string') reject()

    ioRedisClient.lpop(key).then(value => {
      if (expire && Number.isInteger(expire)) {
        // 设置过期时间
        ioRedisClient.expire(key, expire)
      }
      resolve(value)
    }).catch(err => {
      reject(err)
    })
  })
}

module.exports = {
  setArrayRedisItem,
  getArrayRedisItemByRange,
  popArrayRedisItemByRange
}
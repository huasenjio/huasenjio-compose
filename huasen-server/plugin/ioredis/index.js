/*
 * @Autor: huasenjio
 * @Date: 2022-08-21 16:27:32
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-29 21:27:33
 * @Description: ioredis初始化文件
 */
const ioRedis = require('ioredis');
const { MODE, REDIS } = require('../../config.js');

// redis实例
let ioRedisClient = null;

try {
  if (MODE == 'dev') {
    ioRedisClient = new ioRedis({
      host: REDIS.host,
      port: REDIS.port,
      password: REDIS.password,
    });
  } else {
    // 连接docker-compose内的redis容器
    ioRedisClient = new ioRedis({
      host: REDIS.host,
      password: REDIS.password,
    });
  }
  if (ioRedisClient.status === 'connecting') console.log(`ioredis：${REDIS.port}`);
} catch (err) {
  console.log('ioredis failure to start');
}

module.exports = {
  ioRedisClient,
};

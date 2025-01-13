/*
 * @Autor: huasenjio
 * @Date: 2022-08-21 16:27:32
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-29 21:27:33
 * @Description: ioredis初始化文件
 */
const ioRedis = require('ioredis');
const { REDIS } = require('../../config.js');

// redis实例
let ioRedisClient = null;

try {
  if (REDIS.redisDirConnection) {
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
  ioRedisClient.on('ready', () => {
    console.log(`ioredis：${REDIS.port}`)
  });
  ioRedisClient.on('error', (error) => {
    console.log('ioredis 异常', error);
  });
} catch (err) {
  console.log('ioredis 初始化失败', err);
}

module.exports = {
  ioRedisClient,
};

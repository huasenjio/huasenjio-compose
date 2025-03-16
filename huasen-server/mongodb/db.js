/*
 * @Autor: huasenjio
 * @Date: 2021-08-21 21:07:58
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-21 23:51:39
 * @Description:
 */

const mongoose = require('mongoose'); // 引入数据库模块
const { DB } = require('../config.js'); // 配置文件
mongoose.set('useCreateIndex', true); // 使用 createIndex 替代 ensureIndex
// 官方示例
// mongodb://username:password@host:port/database?options


let mongoUrl = null;
if (DB.dbDirConnection) {
  mongoUrl = `mongodb://${DB.name}:${DB.password}@${DB.ip}:${DB.port}/${DB.dbName}?authSource=${DB.dbName}`;
} else {
  mongoUrl = `mongodb://${DB.name}:${DB.password}@${DB.ip}/${DB.dbName}?authSource=${DB.dbName}`;
}


function initMongo() {
  // 连接数据库
  console.log('[Huasen Log]：即将连接数据库...');
  mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
initMongo();

const db = mongoose.connection;
db.on('error', err => {
  console.log('数据库异常', err);
  setTimeout(() => {
    initMongo();
  }, 3000);
});
db.on('open', () => {
  // 连接成功之后，初始化数据库默认数据
  require('./init/initArticle.js');
  console.log(`[Huasen Log]：mongodb 服务端口为${DB.port}`);
});

/*
 * @Autor: huasenjio
 * @Date: 2022-07-31 21:58:49
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-11-15 00:14:51
 * @Description: 初始化数据库
 */

/**
 * docker-compose.yml中设置的管理员账号对应
 * root       MONGO_INITDB_ROOT_USERNAME
 * password   MONGO_INITDB_ROOT_PASSWORD
 */
db.auth("root", "Mongo12345*");

// 需要 MONGO_INITDB_DATABASE 对应
db = db.getSiblingDB("huasen");
db.createUser({
  user: "huasenjio",
  pwd: "Mongo12345*",
  roles: [
    {
      // 赋予这个用户读写 huasen 数据库的权限
      role: "readWrite",
      db: "huasen",
    },
  ],
});

/*
 * @Autor: huasenjio
 * @Date: 2022-07-31 21:58:49
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-06-16 23:32:40
 * @Description: 初始化数据库
 */

// docker-compose.yml中设置的管理员账号对应
// root       MONGO_INITDB_ROOT_USERNAME
// password   MONGO_INITDB_ROOT_PASSWORD

db.auth("root", "Mongo12345*");
const huasenDB = db.getSiblingDB("huasen");

// printjson(huasenDB.getUser("huasenjio"));

// 判断是否存在指定用户
if (!huasenDB.getUser("huasenjio")) {
  print("create user for huasen DB...");
  // 不存在则创建用户
  huasenDB.createUser({
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
}

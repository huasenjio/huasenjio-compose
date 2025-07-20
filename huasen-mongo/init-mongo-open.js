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

// 确保先切换到目标数据库
db = db.getSiblingDB("huasen");

if (!db.getUser("huasenjio")) {
  print("创建 huasenjio 用户...");
  // 创建用户前切换到目标数据库
  db.createUser({
    user: "huasenjio",
    pwd: "Mongo12345*",
    roles: [
      {
        role: "readWrite",
        db: "huasen",
      },
    ],
  });
  print("huasenjio 用户创建成功");
} else {
  print("huasenjio 用户已存在");
}

/*
 * @Autor: huasenjio
 * @Date: 2022-10-01 10:38:33
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-11-14 22:40:24
 * @Description: 初始化管理员账号
 */

global.huasen.working(
  [
    {
      schemaName: 'Manage',
      methodName: 'init',
      payloads: [
        {
          id: 'admin@qq.com',
          password: '12345',
        },
      ],
      self: true,
    },
  ],
  data => {
    if (data) {
      console.log('初始化管理员数据成功：', data);
    }
  },
);

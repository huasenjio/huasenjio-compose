/*
 * @Autor: huasenjio
 * @Date: 2022-10-01 10:38:33
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-19 12:04:23
 * @Description: 初始化管理员账号
 */

const CONFIG = require('../../config.js');
const { encrypt, decrypt } = require('../../utils/aes.js');

global.huasen.createEpWorking(
  [
    {
      schemaName: 'Manage',
      methodName: 'init',
      payloads: [
        {
          id: CONFIG.ADMIN.id,
          password: encrypt(CONFIG.ADMIN.password),
          code: CONFIG.ADMIN.code,
        },
      ],
      self: true,
    },
  ],
  data => {
    if (data) {
      console.log('初始化管理员完成：', data);
    }
  },
);

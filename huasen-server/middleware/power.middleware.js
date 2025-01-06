/*
 * @Autor: huasenjio
 * @Date: 2022-10-05 00:22:37
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-19 11:52:23
 * @Description: 权限校验中间件
 */
const path = require('path');
const _ = require('lodash');

// 检验管理员权限
function checkManagePower(req, res, next) {
  let { proof } = req.huasenJWT;
  req.epWorking(
    [
      {
        schemaName: 'User',
        methodName: 'find',
        payloads: [{ id: proof.key, code: { $gte: 2 } }],
      },
    ],
    users => {
      if (users.length > 0) {
        next();
      } else {
        global.huasen.responseData(res, {}, 'FORBIDDEN', '无管理员权限');
      }
    },
  );
}

// 检验管理员的最高权限
function checkManageHighestPower(req, res, next) {
  let { proof } = req.huasenJWT;
  req.epWorking(
    [
      {
        schemaName: 'User',
        methodName: 'find',
        payloads: [{ id: proof.key, code: 3 }],
      },
    ],
    users => {
      if (users.length > 0) {
        next();
      } else {
        global.huasen.responseData(res, {}, 'ERROR', '权限不足');
      }
    },
  );
}

// 检验管理员唯一
function checkManageAccountUnique(req, res, next) {
  let { id } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'User',
        methodName: 'find',
        payloads: [
          {
            id,
          },
        ],
      },
    ],
    users => {
      if (users.length === 0) {
        next();
      } else {
        global.huasen.responseData(res, {}, 'ERROR', '账号已存在');
      }
    },
  );
}

module.exports = {
  checkManagePower,
  checkManageAccountUnique,
  checkManageHighestPower,
};

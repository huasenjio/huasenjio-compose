/*
 * @Autor: huasenjio
 * @Date: 2022-10-05 00:22:37
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-19 11:52:23
 * @Description: 管理员中间件
 */
const path = require('path');

// 检验管理员权限
function checkManagePower(req, res, next) {
  let { proof } = req.huasenJWT;
  req.epWorking(
    [
      {
        schemaName: 'Manage',
        methodName: 'find',
        payloads: [{ id: proof.key }],
      },
    ],
    manages => {
      if (manages.length > 0) {
        // 放行
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
        schemaName: 'Manage',
        methodName: 'find',
        payloads: [{ id: proof.key, code: proof.code }],
      },
    ],
    manages => {
      if (manages.length > 0) {
        if (manages[0].code === 3) {
          // 放行
          next();
        } else {
          global.huasen.responseData(res, {}, 'ERROR', '管理员权限不足');
        }
      } else {
        global.huasen.responseData(res, {}, 'ERROR', '管理员身份非法');
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
        schemaName: 'Manage',
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

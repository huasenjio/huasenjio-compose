/*
 * @Autor: huasenjio
 * @Date: 2022-10-07 17:44:21
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-31 00:10:48
 * @Description: 用户表控制器
 */
const _ = require('lodash');
const { encrypt, decrypt } = require('huasen-lib');
const JWT = require('../plugin/jwt.js');
const { SECRET_AES } = require('../config.js');
const { onlineByKey } = require('./common.controller.js')


function login(req, res, next) {
  let { id, password } = req.huasenParams;
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
    async function (users) {
      let user = users[0];
      let userPassword = user ? decrypt(user.password, SECRET_AES) : '';
      if (!user) {
        global.huasen.responseData(res, {}, 'ERROR', '用户不存在');
      } else if (userPassword == password) {
        if (user.enabled) {
          // 生成token
          let token = await JWT.createToken(id, { key: id, code: user.code });
          global.huasen.responseData(
            res,
            {
              id,
              token,
              name: user.name,
              code: user.code,
              headImg: user.headImg,
              records: user.records,
              config: user.config,
            },
            'SUCCESS',
            '已登录',
            'rsa',
          );
        } else {
          global.huasen.responseData(res, {}, 'ERROR', '账号已被冻结');
        }
      } else {
        global.huasen.responseData(res, {}, 'ERROR', '账户密码不匹配');
      }
    },
  );
}

function register(req, res, next) {
  let { id, password } = req.huasenParams;
  // 密码加密存入数据库
  let encryptPassword = encrypt(password, SECRET_AES);
  req.epWorking(
    [
      {
        schemaName: 'User',
        methodName: 'insertMany',
        payloads: [{ id, password: encryptPassword }],
      },
    ],
    result => {
      global.huasen.responseData(res, {}, 'SUCCESS', '注册用户');
    },
  );
}

function updatePassword(req, res, next) {
  let { id, password } = req.huasenParams;
  let encryptPassword = encrypt(password, SECRET_AES);
  req.epWorking(
    [
      {
        schemaName: 'User',
        methodName: 'updateOne',
        payloads: [{ id }, { $set: { password: encryptPassword } }, { runValidators: true }],
      },
    ],
    result => {
      global.huasen.responseData(res, {}, 'SUCCESS', '已重置用户密码');
    },
  );
}

function backup(req, res, next) {
  let { proof } = req.huasenJWT;
  let { records, config } = req.huasenParams;
  // 发起更新服务
  req.epWorking(
    [
      {
        schemaName: 'User',
        methodName: 'updateOne',
        payloads: [{ id: proof.key }, { $set: { records, config } }, { runValidators: true }],
      },
    ],
    result => {
      global.huasen.responseData(res, {}, 'SUCCESS', '数据已存储到云端');
    },
  );
}

function recovery(req, res, next) {
  let { proof } = req.huasenJWT;
  req.epWorking(
    [
      {
        schemaName: 'User',
        methodName: 'find',
        payloads: [
          {
            id: proof.key,
          },
        ],
      },
    ],
    async function (users) {
      let user = users[0];
      if (!user) {
        global.huasen.responseData(res, {}, 'ERROR', '用户不存在');
      } else {
        // 剔除密码
        let { records, config } = user;
        global.huasen.responseData(res, { records, config }, 'SUCCESS', '应用云端数据', 'aes');
      }
    },
  );
}

function add(req, res, next) {
  // 密码对称加密存储
  req.huasenParams.password = encrypt(req.huasenParams.password, SECRET_AES);
  req.epWorking(
    [
      {
        schemaName: 'User',
        methodName: 'insertMany',
        payloads: [req.huasenParams],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '添加用户');
    },
  );
}

function findByPage(req, res, next) {
  let { pageNo, pageSize, id, code, name } = req.huasenParams;
  // 模糊查询参数
  let params = { id: { $regex: new RegExp(id, 'i') }, name: { $regex: new RegExp(name, 'i') } };
  if (code !== '' && code !== undefined && code !== null) {
    params.code = code;
  }
  req.epWorking(
    [
      {
        schemaName: 'User',
        methodName: 'findByPage',
        payloads: [
          {
            $and: [params],
          },
          pageNo,
          pageSize,
        ],
        self: true,
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '分页查询用户');
    },
  );
}

function remove(req, res, next) {
  let { _id } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'User',
        methodName: 'deleteOne',
        payloads: [
          {
            _id,
          },
        ],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '删除用户');
    },
  );
}

function update(req, res, next) {
  // 解析修改的记录索引
  let { _id, password } = req.huasenParams;

  req.epWorking(
    [
      {
        schemaName: 'User',
        methodName: 'find',
        payloads: [{ _id }],
      },
    ],
    users => {
      let user = users[0];
      if (!user) {
        global.huasen.responseData(res, result, 'ERROR', '用户不存在');
      } else {
        if (user.password != password) {
          req.huasenParams.password = encrypt(password, SECRET_AES);
        }
        // 发起更新服务
        req.epWorking(
          [
            {
              schemaName: 'User',
              methodName: 'updateOne',
              payloads: [{ _id }, { $set: req.huasenParams }, { runValidators: true }],
            },
          ],
          result => {
            global.huasen.responseData(res, result, 'SUCCESS', '更新用户');
          },
        );
      }
    },
  );
}

function findAppConfig(req, res, next) {
  let systemConfig = require('../setting.json');
  let result = _.omit(systemConfig, ['mail', 'site.jwt', 'site.jwtLiveTime', 'a.jwtLiveTime']);
  global.huasen.responseData(res, result, 'SUCCESS', '查询配置');
}

async function quit(req, res, next) {
  const { proof } = req.huasenJWT;
  onlineByKey(res, proof.key);
}

module.exports = {
  login,
  register,
  updatePassword,
  backup,
  recovery,

  add,
  findByPage,
  remove,
  update,

  findAppConfig,
  quit
};

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
const { offlineByKey } = require('./common.controller.js');
const { User } = require('../service/index.js').schemaMap;

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
        global.huasen.responseData(res, {}, 'ERROR', '账号不存在');
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
      global.huasen.responseData(res, {}, 'SUCCESS', '已注册');
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
      global.huasen.responseData(res, {}, 'SUCCESS', '已重置密码');
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
        global.huasen.responseData(res, {}, 'ERROR', '账号不存在');
      } else {
        // 剔除密码
        let { records, config } = user;
        global.huasen.responseData(res, { records, config }, 'SUCCESS', '应用云端数据', 'aes');
      }
    },
  );
}

function findByPage(req, res, next) {
  let { pageNo, pageSize, id, code, name, enabled } = req.huasenParams;
  let params = { id: { $regex: new RegExp(id, 'i') }, name: { $regex: new RegExp(name, 'i') } };
  if (typeof enabled === 'boolean') {
    params.enabled = enabled;
  }
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
      global.huasen.responseData(res, result, 'SUCCESS', '分页查询');
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
      global.huasen.responseData(res, result, 'SUCCESS', '已添加');
    },
  );
}

function remove(req, res, next) {
  let { _id } = req.huasenParams;
  let { proof } = req.huasenJWT;
  req.epWorking(
    [
      {
        schemaName: 'User',
        methodName: 'find',
        payloads: [{ _id }],
      },
    ],
    async users => {
      let userId = _.get(users, '[0].id');
      if (userId === proof.key) {
        global.huasen.responseData(res, {}, 'ERROR', '无法删除自己');
      } else {
        const result = await User.deleteOne({ _id });
        await JWT.destroyTokenByKey(userId);
        global.huasen.responseData(res, result, 'SUCCESS', '已删除');
      }
    },
  );
}

function update(req, res, next) {
  // 解析修改的记录索引
  let { _id, password, code } = req.huasenParams;
  let { proof } = req.huasenJWT;
  req.epWorking(
    [
      {
        schemaName: 'User',
        methodName: 'find',
      },
    ],
    async users => {
      let user = users.find(user => user._id == _id);
      let manages = users.filter(user => user.code === 3);
      if (!user) {
        global.huasen.responseData(res, result, 'ERROR', '账号不存在');
      } else {
        // 避免用户更新时，不修改密码，导致密码被加密两次，无法登录
        if (user.password !== password) {
          req.huasenParams.password = encrypt(password, SECRET_AES);
        }
        if (user.code === 3 && manages.length < 2 && code < user.code) {
          global.huasen.responseData(res, {}, 'ERROR', '至少保留一个作者权限账号');
        } else {
          // 管理员默认启用账号
          if (code >= 2) {
            req.huasenParams.enabled = true;
          }
          const result = await User.updateOne({ _id }, { $set: req.huasenParams }, { runValidators: true });
          await JWT.destroyTokenByKey(user.id);
          global.huasen.responseData(res, result, 'SUCCESS', '已更新');
        }
      }
    },
  );
}

async function quit(req, res, next) {
  const { proof } = req.huasenJWT;
  offlineByKey(res, proof.key);
}

function manageLogin(req, res, next) {
  let { id, password } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'User',
        methodName: 'find',
        payloads: [
          {
            id,
            // 筛选管理员
            code: { $gte: 2 },
          },
        ],
      },
    ],
    async manages => {
      const manage = manages[0];
      if (!manage) {
        global.huasen.responseData(res, {}, 'ERROR', '管理员不存在');
      } else if (decrypt(manage.password, SECRET_AES) === password) {
        let token = await JWT.createToken(id, { key: id, code: manage.code });
        global.huasen.responseData(
          res,
          {
            id,
            token,
            code: manage.code,
          },
          'SUCCESS',
          '已登录',
          'rsa',
        );
      } else {
        global.huasen.responseData(res, {}, 'ERROR', '账户密码不匹配');
      }
    },
  );
}

async function manageExist(req, res, next) {
  req.epWorking(
    [
      {
        schemaName: 'User',
        methodName: 'find',
        payloads: [
          {
            // 筛选权限码大于等于2的管理用户
            code: { $gte: 2 },
          },
        ],
      },
    ],
    async manages => {
      const manage = manages[0];
      if (!manage) {
        global.huasen.responseData(res, false, 'SUCCESS', '请添加管理员账号');
      } else {
        global.huasen.responseData(res, true, 'SUCCESS', '请登录管理员账号');
      }
    },
  );
}

async function manageInit(req, res, next) {
  req.epWorking(
    [
      {
        schemaName: 'User',
        methodName: 'find',
        payloads: [
          {
            code: { $gte: 2 },
          },
        ],
      },
    ],
    async manages => {
      const manage = manages[0];
      if (!manage) {
        // 初始化创建作者权限账号
        req.huasenParams.code = 3;
        add(req, res, next);
      } else {
        global.huasen.responseData(res, {}, 'ERROR', '已创建管理员账号，请勿重复操作！');
      }
    },
  );
}

module.exports = {
  login,
  register,
  updatePassword,
  backup,
  recovery,
  quit,

  add,
  findByPage,
  remove,
  update,

  manageLogin,
  manageExist,
  manageInit,
};

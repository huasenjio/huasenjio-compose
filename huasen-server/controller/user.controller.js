/*
 * @Autor: huasenjio
 * @Date: 2022-10-07 17:44:21
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-11-06 13:24:00
 * @Description: 用户表控制器
 */
const JWT = require('../plugin/jwt.js');
const { encrypt, decrypt } = require('../utils/aes.js');

function login(req, res, next) {
  let { id, password } = req.huasenParams;
  global.huasen.working(
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
      let userPassword = user ? decrypt(user.password) : '';
      if (!user) {
        global.huasen.responseData(res, {}, 'ERROR', '用户不存在', false);
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
            '登陆成功',
            false,
          );
        } else {
          global.huasen.responseData(res, {}, 'ERROR', '账号已被冻结', false);
        }
      } else {
        global.huasen.responseData(res, {}, 'ERROR', '账户密码不匹配', false);
      }
    },
    req,
  );
}

function register(req, res, next) {
  let { id, password } = req.huasenParams;
  // 密码加密存入数据库
  let encryptPassword = encrypt(password);
  global.huasen.working(
    [
      {
        schemaName: 'User',
        methodName: 'insertMany',
        payloads: [{ id, password: encryptPassword }],
      },
    ],
    result => {
      global.huasen.responseData(res, {}, 'SUCCESS', '注册用户成功', false);
    },
    req,
  );
}

function updatePassword(req, res, next) {
  let { id, password } = req.huasenParams;
  let encryptPassword = encrypt(password);
  global.huasen.working(
    [
      {
        schemaName: 'User',
        methodName: 'updateOne',
        payloads: [{ id }, { $set: { password: encryptPassword } }, { runValidators: true }],
      },
    ],
    result => {
      global.huasen.responseData(res, {}, 'SUCCESS', '更新用户密码成功', false);
    },
    req,
  );
}

function backup(req, res, next) {
  let { proof } = req.huasenJWT;
  let { records, config, name, headImg } = req.huasenParams;
  // 发起更新服务
  global.huasen.working(
    [
      {
        schemaName: 'User',
        methodName: 'updateOne',
        payloads: [{ id: proof.key }, { $set: { records, config, name, headImg } }, { runValidators: true }],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '更新成功', false);
    },
    req,
  );
}

function consistentFromCloud(req, res, next) {
  let { proof } = req.huasenJWT;
  global.huasen.working(
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
        global.huasen.responseData(res, {}, 'ERROR', '用户不存在', false);
      } else {
        // 剔除密码
        delete user.password;
        global.huasen.responseData(res, user, 'SUCCESS', '同步云端数据成功', false);
      }
    },
    req,
  );
}

function add(req, res, next) {
  // 密码对称加密存储
  req.huasenParams.password = encrypt(req.huasenParams.password);
  global.huasen.working(
    [
      {
        schemaName: 'User',
        methodName: 'insertMany',
        payloads: [req.huasenParams],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '添加用户成功', false);
    },
    req,
  );
}

function findAllByPage(req, res, next) {
  let { pageNo, pageSize, id, code } = req.huasenParams;
  // 模糊查询参数
  let params = { id: { $regex: new RegExp(id) } };
  if (code !== '' && code !== undefined && code !== null) {
    params.code = code;
  }
  global.huasen.working(
    [
      {
        schemaName: 'User',
        methodName: 'findAllByPage',
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
      global.huasen.responseData(res, result, 'SUCCESS', '分页查询用户成功', false);
    },
    req,
  );
}

function remove(req, res, next) {
  let { _id } = req.huasenParams;
  global.huasen.working(
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
      global.huasen.responseData(res, result, 'SUCCESS', '删除用户成功', false);
    },
    req,
  );
}

function update(req, res, next) {
  // 解析修改的记录索引
  let { _id, password } = req.huasenParams;
  global.huasen.working(
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
        global.huasen.responseData(res, result, 'ERROR', '用户不存在', false);
      } else {
        if (user.password != password) {
          req.huasenParams.password = encrypt(password);
        }
        // 发起更新服务
        global.huasen.working(
          [
            {
              schemaName: 'User',
              methodName: 'updateOne',
              payloads: [{ _id }, { $set: req.huasenParams }, { runValidators: true }],
            },
          ],
          result => {
            global.huasen.responseData(res, result, 'SUCCESS', '更新用户成功', false);
          },
          req,
        );
      }
    },
    req,
  );
}

module.exports = {
  login,
  register,
  updatePassword,
  backup,
  consistentFromCloud,

  add,
  findAllByPage,
  remove,
  update,
};

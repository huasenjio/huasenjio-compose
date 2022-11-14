/*
 * @Autor: huasenjio
 * @Date: 2022-10-02 00:26:28
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-11-10 08:50:29
 * @Description: 管理控制器
 */

const JWT = require('../plugin/jwt.js');
const path = require('path');
const { readDirectory, unlinkFile } = require('../utils/tool.js');
const DiskInfo = require('node-disk-info');
const { POOL_ACCESS } = require('../config.js');
const { handleRate } = require('../utils/tool.js');

const { getObjectRedisItem } = require('../plugin/ioredis/map.js');

function login(req, res, next) {
  let { id, password } = req.huasenParams;
  global.huasen.working(
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
    async function (result) {
      if (result.length === 0) {
        global.huasen.responseData(res, {}, 'ERROR', '用户不存在', false);
      } else if (result[0].password === password) {
        let token = await JWT.createToken(id, { key: id, code: result[0].code });
        global.huasen.responseData(
          res,
          {
            id,
            token,
            code: result[0].code,
          },
          'SUCCESS',
          '登陆成功',
          false,
        );
      } else {
        global.huasen.responseData(res, {}, 'ERROR', '账户密码不匹配', false);
      }
    },
    req,
  );
}

function add(req, res, next) {
  global.huasen.working(
    [
      {
        schemaName: 'Manage',
        methodName: 'insertMany',
        payloads: [req.huasenParams],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '添加管理员成功', false);
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
        schemaName: 'Manage',
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
      global.huasen.responseData(res, result, 'SUCCESS', '分页查询管理员成功', false);
    },
    req,
  );
}

function remove(req, res, next) {
  let { _id } = req.huasenParams;
  global.huasen.working(
    [
      {
        schemaName: 'Manage',
        methodName: 'deleteOne',
        payloads: [
          {
            _id,
          },
        ],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '删除管理员成功', false);
    },
    req,
  );
}

function update(req, res, next) {
  let { _id } = req.huasenParams;
  global.huasen.working(
    [
      {
        schemaName: 'Manage',
        methodName: 'updateOne',
        payloads: [{ _id }, { $set: req.huasenParams }, { runValidators: true }],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '更新管理员成功', false);
    },
    req,
  );
}

function overview(req, res, next) {
  global.huasen.working(
    [
      {
        schemaName: 'User',
        methodName: 'count',
        self: true,
      },
      {
        schemaName: 'Manage',
        methodName: 'count',
        self: true,
      },
      {
        schemaName: 'Article',
        methodName: 'count',
        self: true,
      },
    ],
    (userCount, manageCount, articleCount) => {
      let fileCount = readDirectory(path.resolve(process.cwd(), '../huasen-store')).length;
      global.huasen.responseData(
        res,
        {
          userCount,
          userRate: handleRate(userCount, global.huasenStatus.userCount),
          manageCount,
          manageRate: handleRate(manageCount, global.huasenStatus.manageCount),
          articleCount,
          articleRate: handleRate(articleCount, global.huasenStatus.articleCount),
          fileCount,
          fileRate: handleRate(fileCount, global.huasenStatus.fileCount),
        },
        'SUCCESS',
        '查询总览成功',
        false,
      );
    },
    req,
  );
}

function diskOverview(req, res, next) {
  let disks = DiskInfo.getDiskInfoSync().map(item => {
    return {
      diskUsage: item.capacity,
      diskName: item.mounted,
      diskUsed: item.used,
      diskFree: item.available,
      diskTotal: item.blocks,
    };
  });
  global.huasen.responseData(res, disks, 'SUCCESS', '查询磁盘信息成功', false);
}

function uvOverview(req, res, next) {
  global.huasen.working(
    [
      {
        schemaName: 'Record',
        methodName: 'limit',
        payloads: [{ time: -1 }, 5],
        self: true,
      },
    ],
    result => {
      let list = result.map(item => {
        let log = item.log;
        let count = log ? Object.keys(log).length : 0;
        return {
          _id: item._id,
          id: item.id,
          time: item.time,
          count,
        };
      });
      global.huasen.responseData(res, list, 'SUCCESS', '查询数据成功', false);
    },
    req,
  );
}

function visitor(req, res, next) {
  getObjectRedisItem(POOL_ACCESS)
    .then(async pool => {
      global.huasen.responseData(
        res,
        {
          visitorCount: Object.values(pool).length,
          visitorRate: handleRate(Object.values(pool).length, global.huasenStatus.visitorCount),
        },
        'SUCCESS',
        '查询数据成功',
        false,
      );
    })
    .catch(err => {
      next(err);
    });
}

function config(req, res, next) {
  global.huasen.working(
    [
      {
        schemaName: 'Manage',
        methodName: 'find',
      },
    ],
    manages => {
      let manage = manages.shift();
      if (manage) {
        global.huasen.responseData(res, manage.config, 'SUCCESS', '查询配置成功', false);
      } else {
        global.huasen.responseData(res, {}, 'ERROR', '无任何配置', false);
      }
    },
    req,
  );
}

module.exports = {
  login,
  add,
  findAllByPage,
  remove,
  update,

  overview,
  visitor,
  diskOverview,
  uvOverview,

  config,
};

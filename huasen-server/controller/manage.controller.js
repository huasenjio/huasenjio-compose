/*
 * @Autor: huasenjio
 * @Date: 2022-10-02 00:26:28
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-06-15 00:41:14
 * @Description: 管理控制器
 */

const JWT = require('../plugin/jwt.js');
const path = require('path');
const { readDirectory, writeToFile, bytesToSize } = require('../utils/tool.js');
const checkDiskSpace = require('check-disk-space').default;
const { POOL_ACCESS } = require('../config.js');
const { handleRate } = require('../utils/tool.js');
const { encrypt, decrypt } = require('../utils/aes.js');
const { Manage } = require('../service/index.js');
const { getObjectRedisItem } = require('../plugin/ioredis/map.js');
const { fetchFavicon, fetchFavicons } = require('@meltwater/fetch-favicon');
const { downloadAndConvertToBase64 } = require('../utils/tool.js');

function login(req, res, next) {
  let { id, password } = req.huasenParams;
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
    async function (result) {
      if (result.length === 0) {
        global.huasen.responseData(res, {}, 'ERROR', '账户不存在', false);
      } else if (decrypt(result[0].password) === password) {
        let token = await JWT.createToken(id, { key: id, code: result[0].code });
        global.huasen.responseData(
          res,
          {
            id,
            token,
            code: result[0].code,
          },
          'SUCCESS',
          '登录成功',
          false,
        );
      } else {
        global.huasen.responseData(res, {}, 'ERROR', '账户密码不匹配', false);
      }
    },
  );
}

function add(req, res, next) {
  let { password } = req.huasenParams;
  // 密码加密存入数据库
  let encryptPassword = encrypt(password);
  req.huasenParams.password = encryptPassword;
  req.epWorking(
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
  );
}

function findAllByPage(req, res, next) {
  let { pageNo, pageSize, id, code } = req.huasenParams;
  // 模糊查询参数
  let params = { id: { $regex: new RegExp(id) } };
  if (code !== '' && code !== undefined && code !== null) {
    params.code = code;
  }
  req.epWorking(
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
  );
}

function remove(req, res, next) {
  let { _id } = req.huasenParams;
  req.epWorking(
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
  );
}

async function update(req, res, next) {
  let { _id, id, password } = req.huasenParams;
  let manageTemp = await Manage.find({ id });
  let manage = manageTemp.shift();
  if (!manage) {
    global.huasen.responseData(res, {}, 'ERROR', '更新账户不存在', false);
    return;
  }
  // 密码改动
  if (password !== manage.password) {
    req.huasenParams.password = encrypt(password);
  }

  let { proof } = req.huasenJWT;

  if (proof.code === 3) {
    // 作者权限
    req.epWorking(
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
    );
  } else if (proof.key === id) {
    // 修改自己
    if (proof.code === req.huasenParams.code) {
      // 禁止修改code
      req.epWorking(
        [
          {
            schemaName: 'Manage',
            methodName: 'updateOne',
            payloads: [{ id: proof.key }, { $set: req.huasenParams }, { runValidators: true }],
          },
        ],
        result => {
          global.huasen.responseData(res, result, 'SUCCESS', '更新管理员成功', false);
        },
      );
    } else {
      global.huasen.responseData(res, {}, 'ERROR', '禁止修改权限码', false);
    }
  } else {
    // 非法
    global.huasen.responseData(res, {}, 'ERROR', '禁止更新其他管理员信息', false);
  }
}

function overview(req, res, next) {
  req.epWorking(
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
        '查询数据报表成功',
        false,
      );
    },
  );
}

function diskOverview(req, res, next) {
  let diskPath = '/';
  let target = __dirname.match(/^[a-zA-Z]:/);
  if (target) diskPath = target[0];
  checkDiskSpace(diskPath)
    .then(diskSpace => {
      let disk = {
        diskName: diskPath === '/' ? '根目录' : diskPath,
        freeValue: bytesToSize(diskSpace.free),
        totalValue: bytesToSize(diskSpace.size),
        useValue: bytesToSize(diskSpace.size - diskSpace.free),
        useUsage: Number(((diskSpace.size - diskSpace.free) / diskSpace.size).toFixed(2)),
      };
      global.huasen.responseData(res, disk, 'SUCCESS', '查询磁盘报表成功', false);
    })
    .catch(err => {
      next(err);
    });
}

function uvOverview(req, res, next) {
  req.epWorking(
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
      global.huasen.responseData(res, list, 'SUCCESS', '查询日志报表成功', false);
    },
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
        '查询用户报表成功',
        false,
      );
    })
    .catch(err => {
      next(err);
    });
}

function config(req, res, next) {
  req.epWorking(
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
  );
}

function executeRuntimeCode(req, res, next) {
  let { runtimeScript } = req.huasenParams;
  try {
    eval(runtimeScript);
  } catch (err) {
    global.huasen.responseData(res, err.toString(), 'ERROR', '执行错误', false);
  }
}

function findAppConfig(req, res, next) {
  let systemConfig = require('../setting.json');
  global.huasen.responseData(res, systemConfig, 'SUCCESS', '查询配置成功', false);
}

function saveAppConfig(req, res, next) {
  let { systemConfig } = req.huasenParams;
  let setPath = path.resolve(__dirname, '../setting.json');
  writeToFile(setPath, systemConfig)
    .then(result => {
      global.huasen.responseData(res, result, 'SUCCESS', '保存配置成功', false);
    })
    .catch(err => {
      global.huasen.responseData(res, {}, 'ERROR', '保存配置失败', false);
    });
}

function findAppFavicon(req, res, next) {
  let { url } = req.huasenParams;
  fetchFavicons(url)
    .then(async icons => {
      let faviconBase64 = [];
      for (let i = 0; i < icons.length; i++) {
        try {
          let base64 = await downloadAndConvertToBase64(icons[i].href);
          faviconBase64.push(base64);
        } catch (err) {
          console.log('下载图片捕获到错误');
        }
      }
      global.huasen.responseData(res, faviconBase64, 'SUCCESS', '查询图标成功', false);
    })
    .catch(err => {
      global.huasen.responseData(res, [], 'ERROR', '查询图标失败', false);
    });
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

  executeRuntimeCode,

  findAppConfig,
  saveAppConfig,

  findAppFavicon,
};

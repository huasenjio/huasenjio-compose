/*
 * @Autor: huasenjio
 * @Date: 2022-10-02 00:26:28
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-06-15 00:41:14
 * @Description: 管理控制器
 */

const path = require('path');
const moment = require('moment');
const checkDiskSpace = require('check-disk-space').default;
const { fetchFavicons } = require('@meltwater/fetch-favicon');
const { encrypt, decrypt } = require('huasen-lib');
const { SECRET_AES, POOL_ACCESS } = require('../config.js');
const JWT = require('../plugin/jwt.js');
const { readDirectory, writeToFile, bytesToSize, handleRate, getTime, downloadAndConvertToBase64 } = require('../utils/tool.js');
const { Manage } = require('../service/index.js');
const { getObjectRedisItem } = require('../plugin/ioredis/map.js');
const { MixtureUpload } = require('../plugin/mixture-upload/index.js');
const { onlineByKey } = require('./common.controller.js')

const uploadConfigMap = {
  icon: {
    uploadPath: path.resolve(process.cwd(), '../huasen-store/icon'),
  },
  banner: {
    uploadPath: path.resolve(process.cwd(), '../huasen-store/banner'),
  },
  article: {
    uploadPath: path.resolve(process.cwd(), '../huasen-store/article'),
  },
  img: {
    uploadPath: path.resolve(process.cwd(), '../huasen-store/img'),
  },
  default: {
    uploadPath: path.resolve(process.cwd(), '../huasen-store/default'),
  },
};

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
        global.huasen.responseData(res, {}, 'ERROR', '账户不存在');
      } else if (decrypt(result[0].password, SECRET_AES) === password) {
        let token = await JWT.createToken(id, { key: id, code: result[0].code });
        global.huasen.responseData(
          res,
          {
            id,
            token,
            code: result[0].code,
          },
          'SUCCESS',
          '已登录',
        );
      } else {
        global.huasen.responseData(res, {}, 'ERROR', '账户密码不匹配');
      }
    },
  );
}

async function exist(req, res, next) {
  let count = await Manage.find().countDocuments();
  if (count > 0) {
    global.huasen.responseData(res, true, 'SUCCESS', '请登录管理员账号');
  } else {
    global.huasen.responseData(res, false, 'SUCCESS', '请添加管理员账号');
  }
}

async function init(req, res, next) {
  let count = await Manage.find().countDocuments();
  if (count === 0) {
    add(req, res, next)
  } else {
    global.huasen.responseData(res, {}, 'ERROR', '管理员账号已存在');
  }
}

function add(req, res, next) {
  let { password } = req.huasenParams;
  // 密码加密存入数据库
  let encryptPassword = encrypt(password, SECRET_AES);
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
      global.huasen.responseData(res, result, 'SUCCESS', '添加管理员');
    },
  );
}

function findByPage(req, res, next) {
  let { pageNo, pageSize, id, code } = req.huasenParams;
  // 模糊查询参数
  let params = { id: { $regex: new RegExp(id, 'i') } };
  if (code !== '' && code !== undefined && code !== null) {
    params.code = code;
  }
  req.epWorking(
    [
      {
        schemaName: 'Manage',
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
      global.huasen.responseData(res, result, 'SUCCESS', '分页查询管理员');
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
      global.huasen.responseData(res, result, 'SUCCESS', '删除管理员');
    },
  );
}

async function update(req, res, next) {
  let { _id, id, password } = req.huasenParams;
  let manageTemp = await Manage.find({ id });
  let manage = manageTemp.shift();
  if (!manage) {
    global.huasen.responseData(res, {}, 'ERROR', '更新账户不存在');
    return;
  }
  // 密码改动
  if (password !== manage.password) {
    req.huasenParams.password = encrypt(password, SECRET_AES);
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
        global.huasen.responseData(res, result, 'SUCCESS', '更新管理员');
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
          global.huasen.responseData(res, result, 'SUCCESS', '更新管理员');
        },
      );
    } else {
      global.huasen.responseData(res, {}, 'ERROR', '禁止修改权限码');
    }
  } else {
    // 非法
    global.huasen.responseData(res, {}, 'ERROR', '你无权更新该管理员信息');
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
        '查询总览数据',
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
      global.huasen.responseData(res, disk, 'SUCCESS', '查询磁盘数据');
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
        payloads: [{ time: -1 }, 5, {}, { __v: 0 }],
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
          time: moment(item.time).format('YYYY/MM/DD'),
          count,
        };
      });
      global.huasen.responseData(res, list, 'SUCCESS', '查询日志数据');
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
        '查询访客数据',
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
        global.huasen.responseData(res, manage.config, 'SUCCESS', '查询配置');
      } else {
        global.huasen.responseData(res, {}, 'ERROR', '无任何配置');
      }
    },
  );
}

function executeRuntimeCode(req, res, next) {
  let { runtimeScript } = req.huasenParams;
  try {
    eval(runtimeScript);
  } catch (err) {
    global.huasen.responseData(res, err.toString(), 'ERROR', '代码执行错误');
  }
}

function findAppConfig(req, res, next) {
  let systemConfig = require('../setting.json');
  global.huasen.responseData(res, systemConfig, 'SUCCESS', '查询配置', 'aes');
}

function saveAppConfig(req, res, next) {
  let { systemConfig } = req.huasenParams;
  let setPath = path.resolve(__dirname, '../setting.json');
  writeToFile(setPath, systemConfig)
    .then(result => {
      global.huasen.responseData(res, result, 'SUCCESS', '保存配置');
    })
    .catch(err => {
      global.huasen.responseData(res, {}, 'ERROR', '保存配置异常');
    });
}

/**
 * 获取网站域名
 * @param {String} urlString - 网站链接地址
 * @returns domain - 域名
 */
function getDomainFromURL(urlString) {
  try {
    // 创建URL对象
    const url = new URL(urlString);
    // 获取域名
    return url.hostname;
  } catch (error) {
    // 如果URL格式不正确，则返回错误信息
    console.error('Invalid URL:', error);
    return null;
  }
}

/**
 * 获取favicon.im图标
 */
function getFaviconByUrl(siteUrl) {
  let domain = getDomainFromURL(siteUrl);
  if (!domain) return;
  return `https://favicon.im/${domain}?larger=true`;
}

async function findAppFavicon(req, res, next) {
  let { url } = req.huasenParams;
  const faviconBase64s = []
  try {
    const icons = await fetchFavicons(url);
    console.log('嗅探的图标icons：', icons);
    for (let i = 0; i < icons.length; i++) {
      try {
        let base64 = await downloadAndConvertToBase64(icons[i].href);
        faviconBase64s.push(base64);
      } catch (err) {
        console.error('下载图片捕获到错误', err);
      }
    }
    const iconUrl = getFaviconByUrl(url)
    if (iconUrl) {
      try {
        let iconUrlBase64 = await downloadAndConvertToBase64(iconUrl);
        faviconBase64s.unshift(iconUrlBase64)
      } catch (err) {
        console.error('下载favicon.im图片捕获到错误', err);
      }
    }
    global.huasen.responseData(res, faviconBase64s, 'SUCCESS', '推荐图标');
  } catch (err) {
    global.huasen.responseData(res, [], 'ERROR', '推荐图标异常');
  }
}

function uploadFileToStore(req, res, next) {
  let type = req.huasenParams.type;
  let option = uploadConfigMap[type] || uploadConfigMap['default'];
  const mixtureUpload = new MixtureUpload({
    ...option,
    handleFilter: file => {
      return true;
    },
    handleFileName: file => {
      let names = file.originalFilename.split('.');
      names.pop(); // 弹出后缀名
      // 把空格替换成下划线
      return `${names.join('').replaceAll(' ', '_')}-${getTime(true)}`;
    },
    onSuccess: (data, files) => {
      let resultFiles = [];
      Object.values(files).forEach(item => {
        if (Array.isArray(item)) {
          resultFiles = resultFiles.concat(item);
        } else {
          resultFiles.push(item);
        }
      });
      for (let i = 0; i < resultFiles.length; i++) {
        resultFiles[i].path = resultFiles[i].path.split(/\/|\\/).slice(-3).join('/');
      }
      global.huasen.responseData(res, resultFiles, 'SUCCESS', '已上传');
    },
    onError: err => {
      global.huasen.responseData(res, {}, 'ERROR', err.msg);
    },
  });
  mixtureUpload.uploader(req, res, next);
}

async function quit(req, res, next) {
  const { proof } = req.huasenJWT;
  onlineByKey(res, proof.key);
}

async function offline(req, res, next) {
  const { id } = req.huasenParams;
  onlineByKey(res, id);
}



module.exports = {
  login,
  exist,
  init,
  add,
  findByPage,
  remove,
  update,
  quit,

  overview,
  visitor,
  diskOverview,
  uvOverview,

  config,

  executeRuntimeCode,

  findAppConfig,
  saveAppConfig,

  findAppFavicon,

  uploadFileToStore,
  offline
};

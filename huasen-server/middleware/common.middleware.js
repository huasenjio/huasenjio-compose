/*
 * @Autor: huasenjio
 * @Date: 2021-10-08 16:30:57
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-04-13 22:44:19
 * @Description: 共用中间件
 */

const fs = require('fs');
const path = require('path');

const session = require('express-session');
const cookieParser = require('cookie-parser');
const moment = require('moment');

const { SESSION, POOL_BLACKLIST, POOL_ACCESS } = require('../config.js');
const { getUid } = require('../utils/tool.js');
const { rsaPrivateKey, privateDecrypt, rsaDecryptLong } = require('../utils/rsa.js');
const JWT = require('../plugin/jwt.js');

// 导入流量控制模块
const { throttle } = require('../plugin/throttle.js');
// reids对象封装
const { setObjectRedisItem, getObjectRedisItem, setObjectFiledRedisItem, isExistObjectFiledRedisItem } = require('../plugin/ioredis/map.js');

// 处理cookie和session中间件，直接通过app.use(handleSession)
const handleSession = session({
  secret: SESSION.secret,
  cookie: SESSION.cookie,
  resave: SESSION.resave,
  saveUninitialized: SESSION.saveUninitialized,
});

// 统计日志
const handleAccessInformation = function (req, res, next) {
  getObjectRedisItem(POOL_ACCESS)
    .then(async pool => {
      // 解析nginx反向代理后的真实ip
      let ip = req.headers['x-forwarded-for'] || req.ip;
      // 生成标识
      let uid = getUid(16, 8);
      // 记录信息
      let userAccess = {
        uid,
        ip,
        url: req.url,
        method: req.method,
        originalUrl: req.originalUrl,
        host: req.hostname,
        referer: req.get('referer'),
        agent: req.get['user-agent'],
        dot: req.get('dot'),
        time: moment().format('YYYY-MM-DD hh:mm:ss'),
      };
      let rawData = JSON.stringify(userAccess);
      await setObjectFiledRedisItem(POOL_ACCESS, uid, rawData);
    })
    .catch(err => {
      next(err);
    });
  // 无需等待redis响应存入，直接放行
  next();
};

// 设置黑名单拦截
const handleBlackList = function (req, res, next) {
  // 以ip为key存储
  let ip = req.headers['x-forwarded-for'] || req.ip;
  getObjectRedisItem(POOL_BLACKLIST)
    .then(blacklistObj => {
      let exist = Object.keys(blacklistObj).some(item => {
        return !!ip.includes(item);
      });
      if (exist) {
        global.huasen.responseData(res, {}, 'ERROR', '黑名单拦截', false);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
};

// 预处理传递的参数
function handleRequestParams(req, res, next) {
  let { query, body } = req;
  // post请求使用非对称加密，需要使用私钥解密
  if (req.method === 'POST' && body.secretMethod === 'rsa') {
    try {
      let raw = rsaDecryptLong('private', body.secretText, 117);
      body = JSON.parse(raw);
    } catch (err) {
      next(err);
    }
  }
  // 合并参数，用于后期业务
  req.huasenParams = Object.assign(query, body);
  next();
}

// 预处理请求携带的凭证信息
function handleJWT(req, res, next) {
  let token = req.get('token');
  JWT.verifyToken(token)
    .then(({ data }) => {
      // 注入到请求对象
      req.huasenJWT = {
        token: token,
        proof: data,
      };
      next();
    })
    .catch(err => {
      req.huasenJWT = {
        token: token,
        proof: {
          key: '',
          code: 0,
        },
      };
      next();
    });
}

// 移除异常参数
function handleUselessParams(req, res, next) {
  Object.keys(req.huasenParams).forEach(key => {
    let value = req.huasenParams[key];
    if (value === '' || value === null || value === undefined || value === 'null' || value === 'undefined') {
      delete req.huasenParams[key];
    }
  });
  next();
}

// 阀门限流
function handleRequest(req, res, next) {
  throttle.addRequest(req, res, next);
}

// 错误处理中间件
const handleRequestError = function (err, req, res, next) {
  // 返回到客户端
  global.huasen.responseData(res, {}, 'ERROR', '发生未知错误', false);
  // 记录错误日志
  global.huasen.formatError(err, '全局错误处理中间件发现错误');
};

module.exports = {
  handleSession,
  handleAccessInformation,
  handleBlackList,
  handleRequestParams,
  handleUselessParams,
  handleRequestError,
  handleRequest,
  handleJWT,
};

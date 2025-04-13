/*
 * @Autor: huasenjio
 * @Date: 2021-10-08 16:30:57
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-04-13 22:44:19
 * @Description: 共用中间件
 */

const _ = require('lodash');
const session = require('express-session');
const CrawlerDetector = require('crawler-detect');

const { SESSION, POOL_BLACKLIST, SECRET_RSA_PRIVATE } = require('../config.js');
const { handleRecord } = require('../utils/record-handle.js');
const { rsaDecryptLong } = require('huasen-lib');
const { decrypt } = require('huasen-lib');
const JWT = require('../plugin/jwt.js');
const { getClientIP } = require('../utils/tool.js')

// 导入流量控制模块
const { throttle } = require('../plugin/throttle.js');
// reids对象封装
const { getObjectRedisItem } = require('../plugin/ioredis/map.js');

// 处理cookie和session中间件，直接通过app.use(handleSession)
const handleSession = session({
  secret: SESSION.secret,
  cookie: SESSION.cookie,
  resave: SESSION.resave,
  saveUninitialized: SESSION.saveUninitialized,
});

// 设置黑名单拦截
const handleBlackList = function (req, res, next) {
  // 以ip为key存储
  let ip = getClientIP(req);
  getObjectRedisItem(POOL_BLACKLIST)
    .then(blacklistObj => {
      let exist = Object.keys(blacklistObj).some(item => {
        return !!ip.includes(item);
      });
      if (exist) {
        global.huasen.responseData(res, {}, 'ERROR', '你在拉黑单中，已禁止访问，劝你善良！');
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
};

// 预处理请求参数，包括：解密数据、合并参数
function handleRequestParams(req, res, next) {
  let { query, body } = req;

  // 查看请求头是否携带私钥
  const secretMethod = req.get('Secret-Method');
  const secretKey = req.get('Secret-Key');
  const secretText = req.body['_secret_text'];
  // 私钥解密对称密钥
  let aesSecret;
  if (secretKey) {
    const aseRaw = rsaDecryptLong('private', SECRET_RSA_PRIVATE, secretKey, 117);
    aesSecret = JSON.parse(aseRaw)
  }
  // 仅支持POST请求加密传输
  if (req.method === 'POST' && secretMethod && secretText) {
    try {
      let raw;
      if (secretMethod === 'rsa') {
        // 非对称解密
        raw = rsaDecryptLong('private', SECRET_RSA_PRIVATE, secretText, 117);
      } else if (secretMethod === 'aesinrsa' && aesSecret) {
        // 私钥解析aes密钥，然后使用aes解密数据
        raw = decrypt(secretText, aesSecret)
      }
      body = JSON.parse(raw);
    } catch (err) {
      next(err);
    }
  }
  // 合并参数，方便后期业务
  const params = Object.assign(query, body, { _aes_secret: aesSecret });
  res.huasenParams = params;
  req.huasenParams = params;
  next();
}

/**
 * 预处理请求携带的凭证信息
 * @param {boolean} intercept - 是否拦截请求
 * @returns 
 */
function handleJWT(intercept = true) {
  return function authentication(req, res, next) {
    const token = req.get('token');
    JWT.verifyToken(token)
      .then(({ data }) => {
        // 注入到请求对象
        req.huasenJWT = {
          token,
          proof: data,
          isManage: _.get(data, 'code') >= 2,
        };
        next();
      })
      .catch(err => {
        let msg = _.get(err, 'msg');
        let tag = _.get(err, 'tag');
        if (intercept) {
          global.huasen.responseData(res, {}, 'FORBIDDEN', msg);
        } else {
          // 不拦截请求，认为普通用户访问，身份凭证数据如下：
          // req.huasenJWT = {
          //   token,
          //   proof: {
          //     code: 0,
          //   },
          //   isManage: false,
          // };
          next();
        }
      });
  }
}

/**
 * 移除异常参数，不支持key为null、undefined、""、"null"、"undefined"的参数，建议只在写入逻辑中使用
 */
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
  // 默认配置
  req.huasenJWT = {
    token: req.get('token'),
    proof: {
      key: '',
      code: 0,
    },
    isManage: false,
  };
  req.huasenParams = {};

  // 解析nginx反向代理后的真实ip
  let ip = getClientIP(req);
  let { url, method, hostname } = req;
  let origin = {
    ip,
    url: url.split('?')[0],
    method,
    host: hostname,
    dot: req.get('dot'),
    referer: req.get('referer'),
    agent: req.get('user-agent'),
    waitTime: 0,
    responseTime: 0,
  };
  let addThrottleTime = 0, handleTime = 0, deleteTime = 0;
  // 添加请求至并发处理模块
  throttle.addRequest(req, res, next, {
    // 添加请求前
    addRequestHook: () => {
      addThrottleTime = new Date().getTime();
    },
    // 处理请求前
    handleRequestHook: () => {
      handleTime = new Date().getTime();
    },
    // 请求销毁后
    deleteRequestHook: () => {
      deleteTime = new Date().getTime();
      // 获取请求参数
      origin.payload = _.get(req, 'huasenParams') || {};
      // 计算等待时间和响应时间
      origin.waitTime = handleTime - addThrottleTime;
      origin.responseTime = deleteTime - handleTime;
      // 用户记录存入缓存
      handleRecord(origin);
    },
  });
}

// 错误处理中间件
const handleRequestError = function (err, req, res, next) {
  // 返回到客户端
  global.huasen.responseData(res, _.get(err, 'message'), 'ERROR', '发生未知错误');
  // 记录错误日志
  global.huasen.formatError(err, '全局错误处理中间件发现错误');
};

/**
 * 检测爬虫
 */
const handleDetectCrawler = function (req, res, next) {
  req.isCrawler = CrawlerDetector.isCrawler(req.headers['user-agent'], (test, ua, match) => {
    if (test) {
      console.warn(`检测爬虫：${test} ${ua} ${match}`);
    }

  });
  next();
};

module.exports = {
  handleSession,
  handleBlackList,
  handleRequestParams,
  handleUselessParams,
  handleRequestError,
  handleRequest,
  handleJWT,
  handleDetectCrawler
};

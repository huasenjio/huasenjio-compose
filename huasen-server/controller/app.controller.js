/*
 * @Autor: huasenjio
 * @Date: 2022-10-22 15:29:02
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-22 15:43:31
 * @Description: 服务控制器
 */
const path = require('path');
const _ = require('lodash');
const setting = require('../setting.json');
const { offlineByKey } = require('./common.controller.js')
const { writeToFile } = require('../utils/tool.js');

async function getCopyright(req, res, next) {
  try {
    const copyright = _.get(setting, 'copyright') || {};
    global.huasen.responseData(res, copyright, 'SUCCESS', '获取版权信息');
  } catch (err) {
    next(err);
  }
}

function findAppConfig(req, res, next) {
  const { proof, isAdmin } = req.huasenJWT;
  let config
  if (isAdmin) {
    config = setting;
  } else {
    config = _.omit(setting, ['mail', 'site.jwt', 'site.jwtLiveTime']);
  }
  global.huasen.responseData(res, config, 'SUCCESS', '查询配置', 'aes');
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

function runCode(req, res, next) {
  let { runtimeScript } = req.huasenParams;
  try {
    // 函数内作用域，动态运行代码
    eval(runtimeScript);
  } catch (err) {
    global.huasen.responseData(res, err.toString(), 'ERROR', '执行代码异常');
  }
}

async function offline(req, res, next) {
  const { id } = req.huasenParams;
  offlineByKey(res, id);
}

async function getDictionary(req, res, next) {
  const { code, draft, pin } = _.get(global, 'hsDic') || {};
  global.huasen.responseData(res, { code, draft, pin }, 'SUCCESS', '获取字典', 'aes');
}

function getCity(req, res, next) {
  const cityData = require('../city.json')
  global.huasen.responseData(res, cityData, 'SUCCESS', '获取城市数据');
}


module.exports = {
  getCopyright,
  findAppConfig,
  saveAppConfig,
  runCode,
  offline,
  getDictionary,
  getCity
};

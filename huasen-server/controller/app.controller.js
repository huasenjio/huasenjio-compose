/*
 * @Autor: huasenjio
 * @Date: 2022-10-22 15:29:02
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-22 15:43:31
 * @Description: 服务控制器
 */
const path = require('path');
const _ = require('lodash');
const { createAbilityHash, createPluginSourceHash, tool } = require('huasen-lib');
const setting = require('../setting.json');
const { LICENSE_SIGN_PUBLIC_KEY } = require('../config.js');
const { offlineByKey } = require('./common.controller.js');
const { verifyLocalLicense } = require('../utils/license/license-check.js');
const { writeToFile } = require('../utils/tool.js');

function getRequestDomain(req) {
  return tool.getPrimaryDomain(req.headers.origin || req.headers.referer || '');
}

function getInstanceFingerprint() {
  return global.huasen.instanceFingerprint || '';
}

async function execOne(runWorking, work) {
  const [err, result] = await runWorking([work]);
  if (err) throw err;
  return result;
}

async function getLicenseRuntimeContext(runWorking) {
  const [abilities, sourceRecords] = await Promise.all([
    execOne(runWorking, { schemaName: 'aiAbility', methodName: 'find', payloads: [{ enabled: true }] }),
    execOne(runWorking, { schemaName: 'aiPluginSource', methodName: 'find', payloads: [{}] }),
  ]);
  const sortedSources = (sourceRecords || []).sort((a, b) => {
    if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
    return new Date(b.updateTime || b.creatTime) - new Date(a.updateTime || a.creatTime);
  });
  const sourceData = sortedSources.find(source => source.isCurrent) || sortedSources[0] || null;
  return {
    feature: 'ai-plugin',
    features: ['ai-plugin'],
    sourceVersion: sourceData ? sourceData.version || '' : '',
    sourceHash: createPluginSourceHash(sourceData),
    abilityHash: createAbilityHash(abilities || []),
  };
}

async function isAdvancedLicenseAuthorized(req) {
  const fingerprint = getInstanceFingerprint();
  if (!fingerprint) return false;

  const domain = getRequestDomain(req);
  const runWorking = req.working.bind(req);
  const runtimeContext = await getLicenseRuntimeContext(runWorking);
  const currentLicenses = await execOne(runWorking, { schemaName: 'license', methodName: 'find', payloads: [{ isCurrent: true }, null, { sort: { updateTime: -1, creatTime: -1 } }] });
  const licenses = currentLicenses.length
    ? currentLicenses
    : await execOne(runWorking, { schemaName: 'license', methodName: 'find', payloads: [{ enabled: true }, null, { sort: { updateTime: -1, creatTime: -1 } }] });

  return (licenses || []).some(item =>
    verifyLocalLicense(item, {
      domain,
      fingerprint,
      publicKey: LICENSE_SIGN_PUBLIC_KEY,
      requireLicenseToken: !global.huasen.isOfficial,
      ignoreLicenseToken: global.huasen.isOfficial,
      ...runtimeContext,
    }).valid,
  );
}

async function getCopyright(req, res, next) {
  try {
    const copyright = _.get(setting, 'copyright') || {};
    global.huasen.responseData(res, copyright, 'SUCCESS', '获取版权信息');
  } catch (err) {
    next(err);
  }
}

async function findAppConfig(req, res, next) {
  try {
    const { isManage } = req.huasenJWT;
    let config = _.cloneDeep(setting);
    if (!isManage) {
      const authorized = await isAdvancedLicenseAuthorized(req);
      _.set(config, 'site.hideCopyrightNotice', Boolean(authorized && _.get(setting, 'site.hideCopyrightNotice')));
      config = _.omit(config, ['mail', 'site.jwt', 'site.jwtLiveTime']);
    }
    global.huasen.responseData(res, config, 'SUCCESS', '查询配置', 'aes');
  } catch (err) {
    next(err);
  }
}

async function saveAppConfig(req, res, next) {
  let { systemConfig } = req.huasenParams;
  let setPath = path.resolve(__dirname, '../setting.json');
  try {
    const nextConfig = JSON.parse(systemConfig);
    if (_.get(nextConfig, 'site.hideCopyrightNotice') === true) {
      const authorized = await isAdvancedLicenseAuthorized(req);
      if (!authorized) _.set(nextConfig, 'site.hideCopyrightNotice', false);
    }
    systemConfig = JSON.stringify(nextConfig, null, 2);
  } catch (err) {
    return global.huasen.responseData(res, {}, 'ERROR', '配置格式异常');
  }
  writeToFile(setPath, systemConfig)
    .then(result => {
      const nextConfig = JSON.parse(systemConfig);
      Object.keys(setting).forEach(key => delete setting[key]);
      Object.assign(setting, nextConfig);
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
  try {
    const { code, draft } = _.get(global, 'hsDic') || {};
    // 从数据库获取pin列表，转换为字典格式
    const pins = await execOne(req.working.bind(req), { schemaName: 'pin', methodName: 'find', payloads: [{}] });
    const pinDict = pins.map(item => ({
      label: item.name,
      value: item._id.toString(),
      color: item.color,
      bgColor: item.bgColor,
    }));
    global.huasen.responseData(res, { code, draft, pin: pinDict }, 'SUCCESS', '获取字典', 'aes');
  } catch (err) {
    next(err);
  }
}

function getCity(req, res, next) {
  const cityData = require('../city.json');
  global.huasen.responseData(res, cityData, 'SUCCESS', '获取城市数据');
}

module.exports = {
  getCopyright,
  findAppConfig,
  saveAppConfig,
  runCode,
  offline,
  getDictionary,
  getCity,
};

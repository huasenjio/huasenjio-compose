/**
 * @description: 授权控制器
 */

const _ = require('lodash');
const { createAbilityHash, createLicenseKeyHash, createPluginSourceHash, tool, postJSON, verifyLicenseTokenSignature } = require('huasen-lib');
const { LICENSE_VERIFY_URL, LICENSE_RISK_REPORT_URL, LICENSE_SIGN_PUBLIC_KEY, LICENSE_SYNC_URL } = require('../config.js');
const { working } = require('../service/index.js');
const { getLicenseTokenPayload, verifyLocalLicense } = require('../utils/license/license-check.js');
const { getLicenseReasonMessage } = require('../utils/license/license-reason.js');

// 授权码基本格式校验
const LICENSE_KEY_PATTERN = /^HS([MYP])([1-9])-([A-Za-z0-9]{8})-([A-Za-z0-9]{8})-([A-Za-z0-9]{2})$/;
const TYPE_LABELS = { M: 'monthly', Y: 'yearly', P: 'permanent' };
const DURATION_MAP = { monthly: 31 * 24 * 60 * 60 * 1000, yearly: 366 * 24 * 60 * 60 * 1000, permanent: null };
const LICENSE_SYNC_KEYS = ['enabled', 'expireAt', 'type', 'fingerprints'];
const LICENSE_TOKEN_SYNC_KEYS = ['licenseToken', 'leaseExpireAt', 'lastSyncAt'];
const ABILITY_SYNC_KEYS = ['abilityCode', 'name', 'icon', 'appId', 'defaultResponseFormat', 'defaultPrompt', 'enabled', 'code'];
const PLUGIN_SOURCE_SYNC_KEYS = ['source', 'version', 'description', 'isCurrent'];
const SYNC_EMPTY_SUMMARY = { licenses: 0, abilities: 0, pluginSource: 0 };
const SYNC_MESSAGE_MAP = {
  NO_LOCAL_LICENSE: '没有授权记录，请先激活授权！',
  NO_FINGERPRINT: '实例指纹不可用，请确保 Docker Socket 已挂载！',
  NO_SYNCABLE_LICENSE: '没有可同步的授权记录',
};
// 尝试加载闭源授权码校验器，开源版回退到正则格式校验
let validateLicenseKey = null;
try {
  const generator = require('../utils/license/closed-source/license-generator.js');
  validateLicenseKey = generator.validateLicenseKey;
} catch (e) {
  validateLicenseKey = function (key) {
    const match = key.match(LICENSE_KEY_PATTERN);
    if (!match) return { valid: false, type: null, version: 0 };
    const typeCode = match[1];
    return {
      valid: true,
      type: TYPE_LABELS[typeCode],
      version: parseInt(match[2], 10),
    };
  };
}

function getOfficialLicenseEndpoint(pathname) {
  const url = new URL(pathname === '/license/center/sync' ? LICENSE_SYNC_URL : LICENSE_VERIFY_URL);
  url.search = '';
  url.hash = '';
  return url.toString();
}

async function execOne(runWorking, work) {
  const [err, result] = await runWorking([work]);
  if (err) throw err;
  return result;
}

function getRequestDomain(req) {
  return tool.getPrimaryDomain(req.headers.origin || req.headers.referer || '');
}

function getInstanceFingerprint() {
  return global.huasen.instanceFingerprint || '';
}

function normalizeVerifyResult(result) {
  const data = _.get(result, 'data') || result || {};
  const msg = _.get(result, 'msg') || _.get(result, 'message') || '';
  return { data, msg };
}

function getClientIp(req) {
  return (req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress || '').split(',')[0].trim();
}

async function reportLicenseRisk(event) {
  const payload = {
    ...event,
    localTime: new Date(),
    sdkVersion: '1',
  };

  if (global.huasen.isOfficial) {
    await execOne(working, { schemaName: 'licenseRiskEvent', methodName: 'create', payloads: [payload] });
    return;
  }

  try {
    await postJSON(LICENSE_RISK_REPORT_URL, payload);
  } catch (e) {
    console.warn('[Huasen License Risk] 上报失败：', e.message);
  }
}

function buildRiskEventFromLicense(licenseRecord, eventType, req, extra = {}) {
  const tokenPayload = getLicenseTokenPayload(licenseRecord) || {};
  return {
    licenseKeyHash: tokenPayload.licenseKeyHash || createLicenseKeyHash(licenseRecord?.licenseKey || ''),
    licenseKey: licenseRecord?.licenseKey || '',
    userId: licenseRecord?.userId || '',
    tokenId: tokenPayload.tokenId || '',
    licenseToken: licenseRecord?.licenseToken || '',
    eventType,
    eventMessage: getLicenseReasonMessage(eventType),
    domain: getRequestDomain(req),
    licenseDomain: tool.getPrimaryDomain(licenseRecord?.domain || tokenPayload.domain || ''),
    fingerprint: getInstanceFingerprint(),
    authorizedFingerprints: licenseRecord?.fingerprints || tokenPayload.fingerprints || [],
    sourceVersion: tokenPayload.sourceVersion || '',
    ip: getClientIp(req),
    userAgent: req.headers['user-agent'] || '',
    ...extra,
  };
}

async function reportInvalidLicenseIfNeeded(licenseRecords, req, options = {}) {
  const domain = getRequestDomain(req);
  const fingerprint = getInstanceFingerprint();
  let lastResult = null;
  for (const record of licenseRecords || []) {
    const result = verifyLocalLicense(record, {
      domain,
      fingerprint,
      publicKey: LICENSE_SIGN_PUBLIC_KEY,
      requireLicenseToken: !global.huasen.isOfficial,
      ignoreLicenseToken: global.huasen.isOfficial,
      feature: options.feature,
      features: options.features,
      sourceVersion: options.sourceVersion,
      sourceHash: options.sourceHash,
      abilityHash: options.abilityHash,
    });
    lastResult = result;
    if (result.valid) return { validLicense: record, result };
    if (
      options.reportRisk &&
      record.licenseToken &&
      [
        'TOKEN_INVALID_SIGNATURE',
        'DOMAIN_MISMATCH',
        'FINGERPRINT_MISMATCH',
        'FEATURE_UNAVAILABLE',
        'LEASE_EXPIRED',
        'LICENSE_RECORD_TAMPERED',
        'SOURCE_VERSION_MISMATCH',
        'SOURCE_HASH_MISMATCH',
        'ABILITY_HASH_MISMATCH',
      ].includes(result.reason)
    ) {
      await reportLicenseRisk(buildRiskEventFromLicense(record, result.reason, req, { tamperedField: result.field || '' }));
    }
  }
  return { validLicense: null, result: lastResult };
}

async function findLicenses(runWorking, query = {}, options = {}) {
  return execOne(runWorking, {
    schemaName: 'license',
    methodName: 'find',
    payloads: [query, null, options],
  });
}

async function markCurrentLicense(runWorking, licenseRecord) {
  if (!licenseRecord || !licenseRecord._id) return;
  await execOne(runWorking, { schemaName: 'license', methodName: 'updateMany', payloads: [{ isCurrent: true, _id: { $ne: licenseRecord._id } }, { isCurrent: false }] });
  if (!licenseRecord.isCurrent) {
    await execOne(runWorking, { schemaName: 'license', methodName: 'updateOne', payloads: [{ _id: licenseRecord._id }, { isCurrent: true }] });
    licenseRecord.isCurrent = true;
  }
}

async function findCurrentLicense(runWorking, req, options = {}) {
  const currentLicenses = await findLicenses(runWorking, { isCurrent: true }, { sort: { updateTime: -1, creatTime: -1 } });
  const currentResult = await reportInvalidLicenseIfNeeded(currentLicenses, req, options);
  if (currentResult.validLicense) {
    await markCurrentLicense(runWorking, currentResult.validLicense);
    return currentResult;
  }
  if (currentLicenses.length) {
    return currentResult;
  }

  const enabledLicenses = await findLicenses(runWorking, { enabled: true }, { sort: { updateTime: -1, creatTime: -1 } });
  const enabledResult = await reportInvalidLicenseIfNeeded(enabledLicenses, req, options);
  if (enabledResult.validLicense) {
    await markCurrentLicense(runWorking, enabledResult.validLicense);
  }
  return enabledResult;
}

async function findCurrentLicenseForSync(runWorking) {
  const currentLicenses = await findLicenses(runWorking, { isCurrent: true }, { sort: { updateTime: -1, creatTime: -1 } });
  const currentLicense = _.get(currentLicenses, '[0]', null);
  if (currentLicense) return currentLicense;

  const enabledLicenses = await findLicenses(runWorking, { enabled: true }, { sort: { updateTime: -1, creatTime: -1 } });
  return _.get(enabledLicenses, '[0]', null);
}

async function findLicensesForSync(runWorking) {
  const currentLicenses = await findLicenses(runWorking, { isCurrent: true }, { sort: { updateTime: -1, creatTime: -1 } });
  if (global.huasen.isOfficial) {
    return currentLicenses;
  }

  const enabledLicenses = await findLicenses(runWorking, { enabled: true }, { sort: { updateTime: -1, creatTime: -1 } });
  const licenseMap = new Map();
  for (const item of currentLicenses.concat(enabledLicenses)) {
    if (item && item.licenseKey) {
      licenseMap.set(item.licenseKey, item);
    }
  }
  return Array.from(licenseMap.values());
}

async function verifyByLicenseCenter(params, runWorking) {
  if (!global.huasen.isOfficial) {
    const { body } = await postJSON(LICENSE_VERIFY_URL, params);
    return normalizeVerifyResult(body);
  }

  const { verifyLicenseRecord } = require('./closed-source/license-center.controller.js');
  const result = await verifyLicenseRecord({ ...params, runWorking });
  return normalizeVerifyResult(result);
}

async function syncByLicenseCenter(params, runWorking) {
  if (!global.huasen.isOfficial) {
    const { body } = await postJSON(getOfficialLicenseEndpoint('/license/center/sync'), params);
    return normalizeOfficialSyncData(body);
  }

  const { syncLicenseRecords } = require('./closed-source/license-center.controller.js');
  return syncLicenseRecords({ ...params, runWorking });
}

function assertValidLicenseKey(licenseKey) {
  if (!licenseKey) return { error: '请输入授权码' };

  const validation = validateLicenseKey(licenseKey);
  if (!validation.valid) return { error: '授权码格式无效' };

  return { licenseType: validation.type };
}

function normalizeOfficialSyncData(responseBody) {
  const data = _.get(responseBody, 'data') || responseBody || {};

  return {
    licenses: Array.isArray(data.licenses) ? data.licenses : [],
    abilities: Array.isArray(data.abilities) ? data.abilities : [],
    pluginSource: data.pluginSource || null,
  };
}

function getActivationFeatureSnapshot(officialData = {}) {
  return {
    abilities: Array.isArray(officialData.abilities) ? officialData.abilities : null,
    pluginSource: officialData.source && officialData.version ? _.pick(officialData, PLUGIN_SOURCE_SYNC_KEYS) : null,
  };
}

function normalizeOfficialAbility(ability) {
  const abilityData = _.pick(ability, ABILITY_SYNC_KEYS);
  if (!abilityData.abilityCode || !abilityData.name) return null;

  return {
    ...abilityData,
    icon: abilityData.icon || '',
    appId: '',
    defaultResponseFormat: abilityData.defaultResponseFormat || 'json_object',
    defaultPrompt: abilityData.defaultPrompt || '',
    enabled: abilityData.enabled === undefined ? true : abilityData.enabled,
    code: abilityData.code || 0,
  };
}

function normalizeOfficialPluginSource(source) {
  const sourceData = _.pick(source, PLUGIN_SOURCE_SYNC_KEYS);
  if (!sourceData.source || !sourceData.version) return null;

  return {
    ...sourceData,
    description: sourceData.description || '',
    isCurrent: true,
  };
}

async function replaceCollection(runWorking, schemaName, docs) {
  await execOne(runWorking, { schemaName, methodName: 'deleteMany', payloads: [{}] });

  for (const doc of docs) {
    await execOne(runWorking, { schemaName, methodName: 'create', payloads: [doc] });
  }

  return docs.length;
}

async function buildAbilityDocs(runWorking, abilities, options = {}) {
  const abilityDocs = abilities.map(normalizeOfficialAbility).filter(Boolean);
  if (!options.preserveAbilityUserConfig || !abilityDocs.length) return abilityDocs;

  const existingAbilities = await execOne(runWorking, { schemaName: 'aiAbility', methodName: 'find', payloads: [{}] });
  const existingAbilityMap = new Map((existingAbilities || []).filter(ability => ability.abilityCode).map(ability => [ability.abilityCode, ability]));

  return abilityDocs.map(ability => {
    const existingAbility = existingAbilityMap.get(ability.abilityCode);
    if (!existingAbility) return ability;

    return {
      ...ability,
      appId: existingAbility.appId !== undefined ? existingAbility.appId : ability.appId,
      defaultPrompt: existingAbility.defaultPrompt !== undefined ? existingAbility.defaultPrompt : ability.defaultPrompt,
    };
  });
}

async function applyOfficialFeatureSnapshot({ abilities, pluginSource }, runWorking, options = {}) {
  const summary = {};

  if (Array.isArray(abilities)) {
    const abilityDocs = await buildAbilityDocs(runWorking, abilities, options);
    summary.abilities = await replaceCollection(runWorking, 'aiAbility', abilityDocs);
  }

  if (pluginSource) {
    const sourceDoc = normalizeOfficialPluginSource(pluginSource);
    summary.pluginSource = await replaceCollection(runWorking, 'aiPluginSource', sourceDoc ? [sourceDoc] : []);
  }

  return summary;
}

async function getLicenseRuntimeContext(runWorking) {
  const abilities = await execOne(runWorking, { schemaName: 'aiAbility', methodName: 'find', payloads: [{ enabled: true }] });
  const sourceRecords = await execOne(runWorking, { schemaName: 'aiPluginSource', methodName: 'find', payloads: [{}] });
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

async function applyOfficialLicenseData({ licenseKey, domain, fingerprint, licenseType, officialData = {}, runWorking, makeCurrent = false, userId = '' }) {
  officialData = officialData || {};
  if (!licenseKey) throw new Error('缺少授权码');
  const primaryDomain = tool.getPrimaryDomain(domain || officialData.domain || '');

  const existingResult = await execOne(runWorking, { schemaName: 'license', methodName: 'find', payloads: [{ licenseKey }] });
  const existingLicense = _.get(existingResult, '[0]', null);
  const nextLicenseData = {
    ..._.pick(officialData, LICENSE_SYNC_KEYS),
    lastVerifiedAt: new Date(),
  };
  if (officialData.lastSyncAt !== undefined) nextLicenseData.lastSyncAt = officialData.lastSyncAt;
  if (global.huasen.isOfficial) {
    nextLicenseData.licenseToken = '';
    nextLicenseData.leaseExpireAt = null;
  } else {
    Object.assign(nextLicenseData, _.pick(officialData, LICENSE_TOKEN_SYNC_KEYS));
  }

  if (domain !== undefined) nextLicenseData.domain = primaryDomain;
  if (makeCurrent) nextLicenseData.isCurrent = true;
  if (fingerprint) {
    const fingerprints = existingLicense ? existingLicense.fingerprints || [] : officialData.fingerprints || [];
    if (!fingerprints.includes(fingerprint)) {
      if (fingerprints.length >= 5) fingerprints.shift();
      fingerprints.push(fingerprint);
    }
    nextLicenseData.fingerprints = fingerprints;
  }

  if (existingLicense) {
    if (makeCurrent) {
      await execOne(runWorking, { schemaName: 'license', methodName: 'updateMany', payloads: [{ isCurrent: true, _id: { $ne: existingLicense._id } }, { isCurrent: false }] });
    }
    await execOne(runWorking, { schemaName: 'license', methodName: 'updateOne', payloads: [{ _id: existingLicense._id }, nextLicenseData] });
  } else {
    if (makeCurrent) {
      await execOne(runWorking, { schemaName: 'license', methodName: 'updateMany', payloads: [{ isCurrent: true }, { isCurrent: false }] });
    }
    const expireAt = officialData.expireAt !== undefined ? officialData.expireAt : DURATION_MAP[licenseType] ? new Date(Date.now() + DURATION_MAP[licenseType]) : null;
    const type = officialData.type || licenseType;
    if (!type) throw new Error('缺少授权类型');
    const createData = {
      licenseKey,
      domain: primaryDomain,
      userId: officialData.userId || userId || '',
      fingerprints: nextLicenseData.fingerprints || (fingerprint ? [fingerprint] : []),
      type,
      expireAt,
      enabled: officialData.enabled === undefined ? true : officialData.enabled,
      isCurrent: makeCurrent,
      licenseToken: global.huasen.isOfficial ? '' : officialData.licenseToken || '',
      leaseExpireAt: global.huasen.isOfficial ? null : officialData.leaseExpireAt || null,
      lastVerifiedAt: new Date(),
    };
    await execOne(runWorking, { schemaName: 'license', methodName: 'create', payloads: [createData] });
  }

  const reloadResult = await execOne(runWorking, { schemaName: 'license', methodName: 'find', payloads: [{ licenseKey }] });
  return { license: _.get(reloadResult, '[0]', null) };
}

function formatActivatedLicense({ license, licenseKey, licenseType, fingerprint, domain, officialData }) {
  const fingerprints = _.get(license, 'fingerprints') || _.get(officialData, 'fingerprints') || (fingerprint ? [fingerprint] : []);
  const primaryDomain = tool.getPrimaryDomain(_.get(license, 'domain') || _.get(officialData, 'domain') || domain || '');

  return {
    activated: true,
    license: {
      licenseKey: _.get(license, 'licenseKey') || _.get(officialData, 'licenseKey') || licenseKey,
      type: _.get(license, 'type') || _.get(officialData, 'type') || licenseType,
      fingerprint,
      fingerprints,
      domain: primaryDomain,
      expireAt: _.get(license, 'expireAt') || _.get(officialData, 'expireAt') || null,
      leaseExpireAt: _.get(license, 'leaseExpireAt') || _.get(officialData, 'leaseExpireAt') || null,
      enabled: _.get(license, 'enabled') !== undefined ? _.get(license, 'enabled') : _.get(officialData, 'enabled') !== undefined ? _.get(officialData, 'enabled') : true,
    },
  };
}

function formatSyncResult(synced, reason, summary = SYNC_EMPTY_SUMMARY) {
  return { synced, reason, summary };
}

/**
 * 从官方服务覆盖同步高级功能数据
 */
async function syncLicenseWithOfficial(options = {}) {
  try {
    const fingerprint = getInstanceFingerprint();
    if (!fingerprint) {
      return formatSyncResult(false, 'NO_FINGERPRINT');
    }

    const localLicenses = await findLicensesForSync(working);
    if (!localLicenses.length) {
      return formatSyncResult(false, 'NO_LOCAL_LICENSE');
    }

    const payload = localLicenses.map(license => ({
      licenseKey: license.licenseKey,
      domain: license.domain || '',
      fingerprints: license.fingerprints || [],
      fingerprint,
    }));

    const officialSnapshot = await syncByLicenseCenter({ licenses: payload, fingerprint }, working);

    for (const update of officialSnapshot.licenses) {
      await applyOfficialLicenseData({
        licenseKey: update.licenseKey,
        domain: update.domain,
        officialData: { ...update, lastSyncAt: new Date() },
        runWorking: working,
      });
    }

    const featureSummary = global.huasen.isOfficial ? {} : await applyOfficialFeatureSnapshot(officialSnapshot, working, options);
    const succeeded = officialSnapshot.licenses.filter(item => item.valid).length;
    const failed = officialSnapshot.licenses.length - succeeded;
    const summary = {
      licenses: officialSnapshot.licenses.length,
      succeeded,
      failed,
      abilities: featureSummary.abilities || 0,
      pluginSource: featureSummary.pluginSource || 0,
    };
    return formatSyncResult(Boolean(succeeded), succeeded ? '' : 'NO_SYNCABLE_LICENSE', summary);
  } catch (e) {
    return formatSyncResult(false, e.message);
  }
}

/**
 * 判断是否应在启动时同步
 */
async function shouldSyncOnBoot() {
  if (!getInstanceFingerprint()) return false;
  const licenses = await findLicensesForSync(working);
  return licenses.length > 0;
}

/**
 * 激活授权码
 * POST /license/activate
 */
async function activate(req, res, next) {
  try {
    const { licenseKey } = req.huasenParams;
    const { error, licenseType } = assertValidLicenseKey(licenseKey);
    if (error) return global.huasen.responseData(res, null, 'ERROR', error);

    const fingerprint = getInstanceFingerprint();
    if (!fingerprint) {
      return global.huasen.responseData(res, null, 'ERROR', '实例指纹不可用，请确保 Docker Socket 已挂载！');
    }

    const domain = getRequestDomain(req);

    let officialValidationResult;
    try {
      officialValidationResult = await verifyByLicenseCenter({ licenseKey, fingerprint, domain }, req.working.bind(req));
    } catch (err) {
      return global.huasen.responseData(res, null, 'ERROR', '授权服务暂不可用');
    }

    const officialValidation = officialValidationResult.data;
    if (!officialValidation || !officialValidation.valid) {
      return global.huasen.responseData(res, null, 'ERROR', officialValidationResult.msg || '授权码无效或已被停用');
    }

    const applied = await applyOfficialLicenseData({
      licenseKey,
      domain,
      fingerprint,
      licenseType,
      officialData: officialValidation,
      runWorking: req.working.bind(req),
      makeCurrent: true,
      userId: _.get(req, 'huasenJWT.proof.key', ''),
    });
    const appliedLicense = applied.license;

    if (!global.huasen.isOfficial) {
      await applyOfficialFeatureSnapshot(getActivationFeatureSnapshot(officialValidation), req.working.bind(req));
    }

    return global.huasen.responseData(
      res,
      formatActivatedLicense({
        license: appliedLicense,
        licenseKey,
        licenseType,
        fingerprint,
        domain,
        officialData: officialValidation,
      }),
      'SUCCESS',
      '激活成功',
    );
  } catch (err) {
    next(err);
  }
}

/**
 * 查询授权状态
 * POST /license/status
 */
async function status(req, res, next) {
  try {
    const domain = getRequestDomain(req);
    const fingerprint = getInstanceFingerprint();

    if (!fingerprint) {
      return global.huasen.responseData(res, { authorized: false, license: null }, 'SUCCESS', '实例指纹不可用');
    }

    const runtimeContext = await getLicenseRuntimeContext(req.working.bind(req));
    const { validLicense, result } = await findCurrentLicense(req.working.bind(req), req, {
      ...runtimeContext,
      reportRisk: false,
    });

    if (!validLicense) {
      const reason = result ? result.reason : 'LICENSE_NOT_FOUND';
      return global.huasen.responseData(
        res,
        {
          authorized: false,
          license: null,
          reason,
          message: getLicenseReasonMessage(reason, '未授权'),
        },
        'SUCCESS',
        getLicenseReasonMessage(reason, '未授权'),
      );
    }

    const licensePayload = result && result.payload ? result.payload : {};

    return global.huasen.responseData(
      res,
      {
        authorized: true,
        license: {
          type: licensePayload.type || validLicense.type,
          expireAt: licensePayload.expireAt || validLicense.expireAt,
          domain: licensePayload.domain || validLicense.domain,
          fingerprintCount: (validLicense.fingerprints || []).length,
        },
      },
      'SUCCESS',
      '已授权',
    );
  } catch (err) {
    next(err);
  }
}

/**
 * 查询当前实例是否已授权高级版
 * POST /license/advanced/status
 */
async function advancedStatus(req, res, next) {
  try {
    const domain = getRequestDomain(req);
    const fingerprint = getInstanceFingerprint();

    if (!fingerprint) {
      return global.huasen.responseData(res, { authorized: false }, 'SUCCESS', '实例指纹不可用');
    }

    const runtimeContext = await getLicenseRuntimeContext(req.working.bind(req));
    const { validLicense, result } = await findCurrentLicense(req.working.bind(req), req, runtimeContext);
    const reason = result ? result.reason : '';

    return global.huasen.responseData(
      res,
      {
        authorized: !!validLicense,
        reason: validLicense ? '' : reason || 'LICENSE_NOT_FOUND',
        message: validLicense ? '' : getLicenseReasonMessage(reason || 'LICENSE_NOT_FOUND', '未授权高级版'),
      },
      'SUCCESS',
      validLicense ? '已授权高级版' : getLicenseReasonMessage(reason || 'LICENSE_NOT_FOUND', '未授权高级版'),
    );
  } catch (err) {
    next(err);
  }
}

/**
 * 手动同步授权状态（向官方服务）
 * POST /license/sync
 */
async function sync(req, res, next) {
  try {
    const result = await syncLicenseWithOfficial({ preserveAbilityUserConfig: false });
    const msg = result.synced ? '同步成功' : SYNC_MESSAGE_MAP[result.reason] || '官方服务异常';
    return global.huasen.responseData(res, result, 'SUCCESS', msg);
  } catch (err) {
    next(err);
  }
}

/**
 * 授权风控事件上报
 * POST /license/risk/report
 */
async function riskReport(req, res, next) {
  try {
    const allowedTypes = [
      'TOKEN_INVALID_SIGNATURE',
      'DOMAIN_MISMATCH',
      'FINGERPRINT_MISMATCH',
      'FEATURE_UNAVAILABLE',
      'LEASE_EXPIRED',
      'LICENSE_RECORD_TAMPERED',
      'SOURCE_VERSION_MISMATCH',
      'SOURCE_HASH_MISMATCH',
      'ABILITY_HASH_MISMATCH',
      'CLOCK_ROLLBACK',
      'SYNC_FAILED_REPEATEDLY',
    ];
    const params = req.huasenParams || {};
    if (!allowedTypes.includes(params.eventType)) {
      return global.huasen.responseData(res, null, 'ERROR', '风控事件类型无效');
    }
    if (!params.licenseToken) {
      return global.huasen.responseData(res, null, 'ERROR', '缺少授权票据');
    }

    const tokenResult = verifyLicenseTokenSignature(params.licenseToken, LICENSE_SIGN_PUBLIC_KEY);
    if (!tokenResult.valid) {
      return global.huasen.responseData(res, null, 'ERROR', '授权票据签名无效');
    }

    const tokenPayload = tokenResult.payload || {};
    if (!tokenPayload.licenseKeyHash || !tokenPayload.tokenId) {
      return global.huasen.responseData(res, null, 'ERROR', '授权票据缺少身份信息');
    }

    let matchedLicense = null;
    const [findErr, licenses] = await req.working([{ schemaName: 'license', methodName: 'find', payloads: [{}] }]);
    if (!findErr) {
      matchedLicense = (licenses || []).find(item => createLicenseKeyHash(item.licenseKey) === tokenPayload.licenseKeyHash) || null;
    }

    const event = {
      licenseKeyHash: tokenPayload.licenseKeyHash,
      licenseKey: matchedLicense ? matchedLicense.licenseKey || '' : '',
      userId: matchedLicense ? matchedLicense.userId || '' : '',
      tokenId: tokenPayload.tokenId,
      eventType: params.eventType,
      eventMessage: getLicenseReasonMessage(params.eventType),
      domain: params.domain || tokenPayload.domain || '',
      licenseDomain: matchedLicense ? tool.getPrimaryDomain(matchedLicense.domain || '') : tokenPayload.domain || '',
      fingerprint: params.fingerprint || '',
      authorizedFingerprints: matchedLicense ? matchedLicense.fingerprints || [] : tokenPayload.fingerprints || [],
      sourceVersion: tokenPayload.sourceVersion || params.sourceVersion || '',
      tamperedField: params.tamperedField || '',
      sdkVersion: tokenPayload.sdkVersion || params.sdkVersion || '',
      localTime: params.localTime || null,
      ip: params.ip || getClientIp(req),
      userAgent: params.userAgent || req.headers['user-agent'] || '',
    };

    const [createErr] = await req.working([{ schemaName: 'licenseRiskEvent', methodName: 'create', payloads: [event] }]);
    if (createErr) return next(createErr);

    if (matchedLicense) {
      const nextScore = Math.min((matchedLicense.riskScore || 0) + 1, 999);
      await req.working([
        {
          schemaName: 'license',
          methodName: 'updateOne',
          payloads: [
            { _id: matchedLicense._id },
            {
              lastRiskReportAt: new Date(),
              riskScore: nextScore,
              riskLevel: nextScore >= 3 ? 'suspicious' : 'normal',
            },
          ],
        },
      ]);
    }

    return global.huasen.responseData(res, { received: true }, 'SUCCESS', '风控事件已记录');
  } catch (err) {
    next(err);
  }
}

// 注册闭源控制层接口
let verify, officialSync, manageAdd, manageUpdate, manageRemove, manageRenew, manageFindByPage;
try {
  const licenseCenter = require('./closed-source/license-center.controller.js');
  verify = licenseCenter.verify;
  officialSync = licenseCenter.sync;

  const manage = require('./closed-source/license-manage.controller.js');
  manageAdd = manage.add;
  manageUpdate = manage.update;
  manageRemove = manage.remove;
  manageRenew = manage.renew;
  manageFindByPage = manage.findByPage;
} catch (e) {}

module.exports = {
  activate,
  status,
  advancedStatus,
  sync,
  riskReport,
  verify,
  officialSync,
  syncLicenseWithOfficial,
  shouldSyncOnBoot,
  manageAdd,
  manageUpdate,
  manageRemove,
  manageRenew,
  manageFindByPage,
};

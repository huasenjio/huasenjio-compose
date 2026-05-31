const path = require('path');
const _ = require('lodash');
const { createAbilityHash, createLicenseKeyHash, createPluginSourceHash, postJSON, tool } = require('huasen-lib');
const { MixtureUpload } = require('../plugin/mixture-upload/index.js');
const { getTime } = require('../utils/tool.js');
const { schemaMap } = require('../service/index.js');
const { chat, chatStream, sanitizeText, normalizeConversationSource } = require('../service/ai-runtime.js');
const config = require('../config.js');
const { getLicenseTokenPayload, verifyLocalLicense } = require('../utils/license/license-check.js');
const { getLicenseReasonMessage } = require('../utils/license/license-reason.js');

const { aiProvider, aiApp, aiPreset, aiKnowledgePack, aiConversation, aiMessage, aiAttachment, aiPluginSource, aiAbility, article, license } = schemaMap;

let hasClosedSourceAbilityManage = false;
try {
  require('./closed-source/ability-manage.controller.js');
  hasClosedSourceAbilityManage = true;
} catch (err) {
  hasClosedSourceAbilityManage = false;
}

function logChatStreamLifecycle(label, payload = {}) {
  console.log(`[ai-chat-stream] ${label}`, {
    time: new Date().toISOString(),
    ...payload,
  });
}

function normalizeBoolean(value) {
  if (value === true || value === false) return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

function buildRegexQuery(query, key, value) {
  if (value !== '' && value !== undefined && value !== null) {
    query[key] = { $regex: new RegExp(value, 'i') };
  }
}

function normalizePermissionCode(code, defaultCode = 0) {
  const normalized = Number(code);
  if (Number.isInteger(normalized) && normalized >= 0 && normalized <= 3) {
    return normalized;
  }
  return defaultCode;
}

function buildAppPermissionQuery(code) {
  const normalizedCode = normalizePermissionCode(code);
  return {
    $or: [{ code: { $lte: normalizedCode } }, { code: { $exists: false } }],
  };
}

function appendAppCodeQuery(query, code) {
  const normalizedCode = normalizePermissionCode(code);
  if (normalizedCode === 0) {
    query.$or = [{ code: 0 }, { code: { $exists: false } }];
  } else {
    query.code = normalizedCode;
  }
}

function resolveProviderCapability(provider, key, defaultValue) {
  if (!provider) return defaultValue;
  if (provider[key] !== undefined) return provider[key];
  try {
    const extraConfig = JSON.parse(provider.extraConfig || '{}');
    const legacyCaps = _.get(extraConfig, 'capabilities', {});
    if (legacyCaps[key] !== undefined) {
      return legacyCaps[key];
    }
  } catch (err) {
    // ignore legacy extraConfig parse errors
  }
  return defaultValue;
}

function resolveAppPresetId(item = {}) {
  return item.presetId || '';
}

function normalizeAppRecord(item) {
  const raw = typeof item.toObject === 'function' ? item.toObject() : item;
  return {
    ...raw,
    code: normalizePermissionCode(raw.code),
    presetId: resolveAppPresetId(raw),
  };
}

function normalizeAppPageData(data) {
  if (!data || !Array.isArray(data.list)) return data;
  return {
    ...data,
    list: data.list.map(item => normalizeAppRecord(item)),
  };
}

function normalizeAppPayload(params = {}) {
  const normalized = params;
  if (Object.prototype.hasOwnProperty.call(params, 'code')) {
    normalized.code = normalizePermissionCode(params.code);
  }
  if (Object.prototype.hasOwnProperty.call(params, 'presetId')) {
    normalized.presetId = resolveAppPresetId(params);
  }
  return normalized;
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map(item => String(item || '')).filter(Boolean);
}

function buildKnowledgePackAppQuery(appId) {
  return {
    $or: [{ appIds: { $size: 0 } }, { appIds: appId }],
  };
}

function normalizeKnowledgePackPayload(params = {}) {
  const normalized = params;
  normalized.appIds = normalizeStringArray(params.appIds);
  normalized.articleIds = normalizeStringArray(params.articleIds);
  if (Object.prototype.hasOwnProperty.call(params, 'code')) {
    normalized.code = normalizePermissionCode(params.code);
  }
  if (Object.prototype.hasOwnProperty.call(params, 'maxArticles')) {
    normalized.maxArticles = Math.max(1, Number(params.maxArticles) || 5);
  }
  if (Object.prototype.hasOwnProperty.call(params, 'maxKnowledgeChars')) {
    normalized.maxKnowledgeChars = Math.max(1000, Number(params.maxKnowledgeChars) || 20000);
  }
  return normalized;
}

async function buildKnowledgePackDisplayList(list = []) {
  const appIds = [];
  const articleIds = [];
  list.forEach(item => {
    appIds.push(...(item.appIds || []));
    articleIds.push(...(item.articleIds || []));
  });
  const [apps, articles] = await Promise.all([
    appIds.length ? aiApp.find({ _id: { $in: appIds } }, { name: 1 }) : Promise.resolve([]),
    articleIds.length ? article.find({ _id: { $in: articleIds } }, { title: 1 }) : Promise.resolve([]),
  ]);
  return list.map(item => {
    const raw = typeof item.toObject === 'function' ? item.toObject() : item;
    return {
      ...raw,
      appNames: (raw.appIds || []).map(id => {
        const target = apps.find(app => String(app._id) === String(id));
        return target ? target.name : id;
      }),
      articleTitles: (raw.articleIds || []).map(id => {
        const target = articles.find(article => String(article._id) === String(id));
        return target ? target.title : id;
      }),
    };
  });
}

async function buildConversationDisplayList(list = []) {
  const knowledgePackIds = [];
  list.forEach(item => {
    (item.knowledgePackIds || []).forEach(id => knowledgePackIds.push(id));
  });
  const packs = knowledgePackIds.length ? await aiKnowledgePack.find({ _id: { $in: knowledgePackIds } }, { name: 1 }) : [];
  return list.map(item => {
    const raw = typeof item.toObject === 'function' ? item.toObject() : item;
    return {
      ...raw,
      knowledgePackNames: (raw.knowledgePackIds || []).map(id => {
        const target = packs.find(pack => String(pack._id) === String(id));
        return target ? target.name : id;
      }),
    };
  });
}

async function resolveAvailableKnowledgePackIds({ userCode = 0, appId, knowledgePackIds = [] }) {
  const ids = normalizeStringArray(knowledgePackIds);
  if (!ids.length) return [];
  const packs = await aiKnowledgePack.find({
    _id: { $in: ids },
    enabled: true,
    code: { $lte: normalizePermissionCode(userCode) },
    ...buildKnowledgePackAppQuery(appId),
  });
  const availableIds = packs.map(item => String(item._id));
  return ids.filter(id => availableIds.includes(String(id)));
}

async function findPublishedPluginSource() {
  return aiPluginSource.findOne({ isCurrent: true }).sort({ updateTime: -1, _id: -1 });
}

function getRequestDomain(req) {
  return tool.getPrimaryDomain(req.headers.origin || req.headers.referer || '');
}

function getInstanceFingerprint() {
  return global.huasen.instanceFingerprint || '';
}

function getClientIp(req) {
  if (!req) return '';
  return (req.headers['x-forwarded-for'] || req.ip || '').trim();
}

async function reportPluginLicenseRisk(payload) {
  try {
    const { body } = await postJSON(config.LICENSE_RISK_REPORT_URL, payload, { timeout: 3000 });
    if (!body || body.code !== 200) {
      console.warn('[Huasen License Risk] 上报失败：', body ? body.msg : '官方服务响应异常');
    }
  } catch (e) {
    console.warn('[Huasen License Risk] 上报失败：', e.message);
  }
}

function formatPluginLicense(licenseRecord) {
  if (!licenseRecord) return null;

  return {
    type: licenseRecord.type,
    domain: tool.getPrimaryDomain(licenseRecord.domain || ''),
    expireAt: licenseRecord.expireAt || null,
    fingerprintCount: (licenseRecord.fingerprints || []).length,
  };
}

function formatPluginStatusPayload({ authorized, reason = '', message = '', licenseRecord = null, sourceData = null, abilities = [] }) {
  return {
    authorized,
    reason,
    message: message || getLicenseReasonMessage(reason),
    license: formatPluginLicense(licenseRecord),
    source: sourceData ? sourceData.source : '',
    version: sourceData ? sourceData.version : '',
    abilities: authorized ? abilities || [] : [],
  };
}

async function findAvailableLicense(domain, fingerprint, options = {}) {
  if (!fingerprint) return { licenseRecord: null, result: { valid: false, reason: 'NO_FINGERPRINT' } };

  const request = options.req || null;
  const licenses = await license.find({ enabled: true });
  const riskReasons = [
    'TOKEN_INVALID_SIGNATURE',
    'DOMAIN_MISMATCH',
    'FINGERPRINT_MISMATCH',
    'FEATURE_UNAVAILABLE',
    'LEASE_EXPIRED',
    'LICENSE_RECORD_TAMPERED',
    'SOURCE_VERSION_MISMATCH',
    'SOURCE_HASH_MISMATCH',
    'ABILITY_HASH_MISMATCH',
  ];
  let lastResult = { valid: false, reason: 'LICENSE_NOT_FOUND' };

  for (const item of licenses || []) {
    const result = verifyLocalLicense(item, {
      domain,
      fingerprint,
      publicKey: config.LICENSE_SIGN_PUBLIC_KEY,
      requireLicenseToken: !global.huasen.isOfficial,
      ignoreLicenseToken: global.huasen.isOfficial,
      feature: options.feature,
      features: options.features,
      sourceVersion: options.sourceVersion,
      sourceHash: options.sourceHash,
      abilityHash: options.abilityHash,
    });
    lastResult = result;
    if (result.valid) return { licenseRecord: item, result };
    if (item.licenseToken && riskReasons.includes(result.reason)) {
      const tokenPayload = getLicenseTokenPayload(item) || {};
      await reportPluginLicenseRisk({
        licenseKeyHash: tokenPayload.licenseKeyHash || createLicenseKeyHash(item.licenseKey || ''),
        tokenId: tokenPayload.tokenId || '',
        licenseToken: item.licenseToken || '',
        eventType: result.reason,
        eventMessage: getLicenseReasonMessage(result.reason),
        domain,
        licenseDomain: tool.getPrimaryDomain(item.domain || tokenPayload.domain || ''),
        fingerprint,
        authorizedFingerprints: item.fingerprints || tokenPayload.fingerprints || [],
        sourceVersion: tokenPayload.sourceVersion || '',
        tamperedField: result.field || '',
        localTime: new Date(),
        ip: getClientIp(request),
        userAgent: request ? request.headers['user-agent'] || '' : '',
        sdkVersion: '1',
      });
    }
  }

  return { licenseRecord: null, result: lastResult };
}

async function getLocalPluginSnapshot() {
  const [sourceData, abilities] = await Promise.all([findPublishedPluginSource(), aiAbility.find({ enabled: true })]);
  return { sourceData, abilities };
}

async function findProviderByList(req, res, next) {
  try {
    const { enabled, providerType } = req.huasenParams;
    const query = {};
    const enabledValue = normalizeBoolean(enabled);
    if (typeof enabledValue === 'boolean') {
      query.enabled = enabledValue;
    }
    if (providerType) {
      query.providerType = providerType;
    }
    const list = await aiProvider.find(query).sort({ _id: -1 });
    global.huasen.responseData(res, list, 'SUCCESS', '查询AI供应商列表');
  } catch (err) {
    next(err);
  }
}

async function findProviderByPage(req, res, next) {
  try {
    const { pageNo, pageSize, name, providerType, enabled } = req.huasenParams;
    const query = {};
    buildRegexQuery(query, 'name', name);
    if (providerType) {
      query.providerType = providerType;
    }
    const enabledValue = normalizeBoolean(enabled);
    if (typeof enabledValue === 'boolean') {
      query.enabled = enabledValue;
    }
    const [err, data] = await req.working([
      {
        schemaName: 'aiProvider',
        methodName: 'findByPage',
        payloads: [query, pageNo, pageSize],
        self: true,
      },
    ]);
    if (err) {
      return global.huasen.responseData(res, null, 'ERROR', '分页查询AI供应商异常');
    }
    global.huasen.responseData(res, data, 'SUCCESS', '分页查询AI供应商');
  } catch (err) {
    next(err);
  }
}

async function addProvider(req, res, next) {
  try {
    const [err, data] = await req.working([
      {
        schemaName: 'aiProvider',
        methodName: 'insertMany',
        payloads: [req.huasenParams],
      },
    ]);
    if (err) {
      return global.huasen.responseData(res, null, 'ERROR', '新增AI供应商异常');
    }
    global.huasen.responseData(res, data, 'SUCCESS', '新增AI供应商');
  } catch (err) {
    next(err);
  }
}

async function updateProvider(req, res, next) {
  try {
    const { _id } = req.huasenParams;
    const [err, data] = await req.working([
      {
        schemaName: 'aiProvider',
        methodName: 'updateOne',
        payloads: [{ _id }, { $set: req.huasenParams }, { runValidators: true }],
      },
    ]);
    if (err) {
      return global.huasen.responseData(res, null, 'ERROR', '更新AI供应商异常');
    }
    global.huasen.responseData(res, data, 'SUCCESS', '更新AI供应商');
  } catch (err) {
    next(err);
  }
}

async function removeProvider(req, res, next) {
  try {
    const { _id } = req.huasenParams;
    const [apps, presets] = await Promise.all([aiApp.find({ providerId: _id }), aiPreset.find({ providerId: _id })]);
    if ((apps || []).length || (presets || []).length) {
      return global.huasen.responseData(res, null, 'ERROR', '请先移除关联的AI应用或模型预设');
    }
    const result = await aiProvider.deleteOne({ _id });
    global.huasen.responseData(res, result, 'SUCCESS', '删除AI供应商');
  } catch (err) {
    next(err);
  }
}

async function findAppByList(req, res, next) {
  try {
    const { enabled, providerId, code } = req.huasenParams;
    const query = {};
    const enabledValue = normalizeBoolean(enabled);
    if (typeof enabledValue === 'boolean') {
      query.enabled = enabledValue;
    }
    if (providerId) {
      query.providerId = providerId;
    }
    if (code !== '' && code !== undefined && code !== null) {
      appendAppCodeQuery(query, code);
    }
    const list = await aiApp.find(query).sort({ sort: -1, _id: -1 });
    global.huasen.responseData(
      res,
      list.map(item => normalizeAppRecord(item)),
      'SUCCESS',
      '查询AI应用列表',
    );
  } catch (err) {
    next(err);
  }
}

async function findAppByPage(req, res, next) {
  try {
    const { pageNo, pageSize, name, providerId, enabled, code } = req.huasenParams;
    const query = {};
    buildRegexQuery(query, 'name', name);
    if (providerId) {
      query.providerId = providerId;
    }
    const enabledValue = normalizeBoolean(enabled);
    if (typeof enabledValue === 'boolean') {
      query.enabled = enabledValue;
    }
    if (code !== '' && code !== undefined && code !== null) {
      appendAppCodeQuery(query, code);
    }
    const [err, data] = await req.working([
      {
        schemaName: 'aiApp',
        methodName: 'findByPage',
        payloads: [query, pageNo, pageSize],
        self: true,
      },
    ]);
    if (err) {
      return global.huasen.responseData(res, null, 'ERROR', '分页查询AI应用异常');
    }
    global.huasen.responseData(res, normalizeAppPageData(data), 'SUCCESS', '分页查询AI应用');
  } catch (err) {
    next(err);
  }
}

async function addApp(req, res, next) {
  try {
    // 校验供应商是否存在
    if (req.huasenParams.providerId) {
      const [providerErr, providers] = await req.working([
        {
          schemaName: 'aiProvider',
          methodName: 'find',
          payloads: [{ _id: req.huasenParams.providerId }],
        },
      ]);
      if (providerErr || !(providers || []).length) {
        return global.huasen.responseData(res, null, 'ERROR', 'AI供应商不存在');
      }
    }
    // 校验模型预设是否存在
    const appPresetId = resolveAppPresetId(req.huasenParams);
    if (appPresetId) {
      const preset = await aiPreset.findOne({ _id: appPresetId });
      if (!preset) {
        return global.huasen.responseData(res, null, 'ERROR', '模型预设不存在');
      }
    }
    const params = normalizeAppPayload(req.huasenParams);
    const [err, data] = await req.working([
      {
        schemaName: 'aiApp',
        methodName: 'insertMany',
        payloads: [params],
      },
    ]);
    if (err) {
      console.error(err);
      return global.huasen.responseData(res, null, 'ERROR', '新增AI应用异常');
    }
    global.huasen.responseData(res, data, 'SUCCESS', '新增AI应用');
  } catch (err) {
    next(err);
  }
}

async function updateApp(req, res, next) {
  try {
    const { _id, providerId } = req.huasenParams;
    if (providerId) {
      const provider = await aiProvider.findOne({ _id: providerId });
      if (!provider) {
        return global.huasen.responseData(res, null, 'ERROR', 'AI供应商不存在');
      }
    }
    const appPresetId = resolveAppPresetId(req.huasenParams);
    if (appPresetId) {
      const preset = await aiPreset.findOne({ _id: appPresetId });
      if (!preset) {
        return global.huasen.responseData(res, null, 'ERROR', '模型预设不存在');
      }
    }
    const params = normalizeAppPayload(req.huasenParams);
    const [err, data] = await req.working([
      {
        schemaName: 'aiApp',
        methodName: 'updateOne',
        payloads: [{ _id }, { $set: params }, { runValidators: true }],
      },
    ]);
    if (err) {
      return global.huasen.responseData(res, null, 'ERROR', '更新AI应用异常');
    }
    global.huasen.responseData(res, data, 'SUCCESS', '更新AI应用');
  } catch (err) {
    next(err);
  }
}

async function removeApp(req, res, next) {
  try {
    const { _id } = req.huasenParams;
    const result = await aiApp.deleteOne({ _id });
    await aiPreset.deleteMany({ appId: _id });
    global.huasen.responseData(res, result, 'SUCCESS', '删除AI应用');
  } catch (err) {
    next(err);
  }
}

async function findPresetByList(req, res, next) {
  try {
    const { enabled, providerId, appId } = req.huasenParams;
    const query = {};
    const enabledValue = normalizeBoolean(enabled);
    if (typeof enabledValue === 'boolean') {
      query.enabled = enabledValue;
    }
    if (providerId) {
      query.providerId = providerId;
    }
    if (appId) {
      query.appId = appId;
    }
    const list = await aiPreset.find(query).sort({ _id: -1 });
    global.huasen.responseData(res, list, 'SUCCESS', '查询模型预设列表');
  } catch (err) {
    next(err);
  }
}

async function findPresetByPage(req, res, next) {
  try {
    const { pageNo, pageSize, name, providerId, appId, enabled } = req.huasenParams;
    const query = {};
    buildRegexQuery(query, 'name', name);
    if (providerId) {
      query.providerId = providerId;
    }
    if (appId) {
      query.appId = appId;
    }
    const enabledValue = normalizeBoolean(enabled);
    if (typeof enabledValue === 'boolean') {
      query.enabled = enabledValue;
    }
    const [err, data] = await req.working([
      {
        schemaName: 'aiPreset',
        methodName: 'findByPage',
        payloads: [query, pageNo, pageSize],
        self: true,
      },
    ]);
    if (err) {
      return global.huasen.responseData(res, null, 'ERROR', '分页查询模型预设异常');
    }
    global.huasen.responseData(res, data, 'SUCCESS', '分页查询模型预设');
  } catch (err) {
    next(err);
  }
}

async function addPreset(req, res, next) {
  try {
    const { appId, providerId } = req.huasenParams;
    if (appId) {
      const [err, apps] = await req.working([
        {
          schemaName: 'aiApp',
          methodName: 'find',
          payloads: [{ _id: appId }],
        },
      ]);
      if (err || !(apps || []).length) {
        return global.huasen.responseData(res, null, 'ERROR', 'AI应用不存在');
      }
    }
    if (providerId) {
      const [err, providers] = await req.working([
        {
          schemaName: 'aiProvider',
          methodName: 'find',
          payloads: [{ _id: providerId }],
        },
      ]);
      if (err || !(providers || []).length) {
        return global.huasen.responseData(res, null, 'ERROR', 'AI供应商不存在');
      }
    }
    const [insertErr, data] = await req.working([
      {
        schemaName: 'aiPreset',
        methodName: 'insertMany',
        payloads: [req.huasenParams],
      },
    ]);
    if (insertErr) {
      return global.huasen.responseData(res, null, 'ERROR', '新增模型预设异常');
    }
    global.huasen.responseData(res, data, 'SUCCESS', '新增模型预设');
  } catch (err) {
    next(err);
  }
}

async function updatePreset(req, res, next) {
  try {
    const { _id, appId, providerId } = req.huasenParams;
    if (appId) {
      const app = await aiApp.findOne({ _id: appId });
      if (!app) {
        return global.huasen.responseData(res, null, 'ERROR', 'AI应用不存在');
      }
    }
    if (providerId) {
      const provider = await aiProvider.findOne({ _id: providerId });
      if (!provider) {
        return global.huasen.responseData(res, null, 'ERROR', 'AI供应商不存在');
      }
    }
    const [err, data] = await req.working([
      {
        schemaName: 'aiPreset',
        methodName: 'updateOne',
        payloads: [{ _id }, { $set: req.huasenParams }, { runValidators: true }],
      },
    ]);
    if (err) {
      return global.huasen.responseData(res, null, 'ERROR', '更新模型预设异常');
    }
    global.huasen.responseData(res, data, 'SUCCESS', '更新模型预设');
  } catch (err) {
    next(err);
  }
}

async function removePreset(req, res, next) {
  try {
    const { _id } = req.huasenParams;
    const result = await aiPreset.deleteOne({ _id });
    await aiApp.updateMany({ presetId: _id }, { $set: { presetId: '' } });
    global.huasen.responseData(res, result, 'SUCCESS', '删除模型预设');
  } catch (err) {
    next(err);
  }
}

async function findKnowledgePackByList(req, res, next) {
  try {
    const { enabled, appId } = req.huasenParams;
    const query = {};
    const enabledValue = normalizeBoolean(enabled);
    if (typeof enabledValue === 'boolean') {
      query.enabled = enabledValue;
    }
    if (appId) {
      Object.assign(query, buildKnowledgePackAppQuery(appId));
    }
    const list = await aiKnowledgePack.find(query).sort({ _id: -1 });
    global.huasen.responseData(res, await buildKnowledgePackDisplayList(list), 'SUCCESS', '查询知识包列表');
  } catch (err) {
    next(err);
  }
}

async function findKnowledgePackByPage(req, res, next) {
  try {
    const { pageNo = 1, pageSize = 10, name, enabled, appId } = req.huasenParams;
    const query = {};
    buildRegexQuery(query, 'name', name);
    const enabledValue = normalizeBoolean(enabled);
    if (typeof enabledValue === 'boolean') {
      query.enabled = enabledValue;
    }
    if (appId) {
      Object.assign(query, buildKnowledgePackAppQuery(appId));
    }
    const realPageNo = Number(pageNo) || 1;
    const realPageSize = Number(pageSize) || 10;
    const [list, total] = await Promise.all([
      aiKnowledgePack
        .find(query)
        .sort({ _id: -1 })
        .limit(realPageSize)
        .skip((realPageNo - 1) * realPageSize),
      aiKnowledgePack.countDocuments(query),
    ]);
    global.huasen.responseData(res, { list: await buildKnowledgePackDisplayList(list), total }, 'SUCCESS', '分页查询知识包');
  } catch (err) {
    next(err);
  }
}

async function addKnowledgePack(req, res, next) {
  try {
    const params = normalizeKnowledgePackPayload(req.huasenParams);
    const [insertErr, data] = await req.working([
      {
        schemaName: 'aiKnowledgePack',
        methodName: 'insertMany',
        payloads: [params],
      },
    ]);
    if (insertErr) {
      return global.huasen.responseData(res, null, 'ERROR', '新增知识包异常');
    }
    global.huasen.responseData(res, data, 'SUCCESS', '新增知识包');
  } catch (err) {
    next(err);
  }
}

async function updateKnowledgePack(req, res, next) {
  try {
    const { _id } = req.huasenParams;
    const params = normalizeKnowledgePackPayload(req.huasenParams);
    const [err, data] = await req.working([
      {
        schemaName: 'aiKnowledgePack',
        methodName: 'updateOne',
        payloads: [{ _id }, { $set: params }, { runValidators: true }],
      },
    ]);
    if (err) {
      return global.huasen.responseData(res, null, 'ERROR', '更新知识包异常');
    }
    global.huasen.responseData(res, data, 'SUCCESS', '更新知识包');
  } catch (err) {
    next(err);
  }
}

async function removeKnowledgePack(req, res, next) {
  try {
    const { _id } = req.huasenParams;
    const result = await aiKnowledgePack.deleteOne({ _id });
    await aiConversation.updateMany({ knowledgePackIds: _id }, { $pull: { knowledgePackIds: _id } });
    global.huasen.responseData(res, result, 'SUCCESS', '删除知识包');
  } catch (err) {
    next(err);
  }
}

async function findUserKnowledgePackList(req, res, next) {
  try {
    const { proof } = req.huasenJWT;
    const { appId } = req.huasenParams;
    const app = await aiApp.findOne({ _id: appId, enabled: true, ...buildAppPermissionQuery(proof.code) });
    if (!app) {
      return global.huasen.responseData(res, [], 'SUCCESS', '查询知识包列表');
    }
    const list = await aiKnowledgePack
      .find({
        enabled: true,
        code: { $lte: normalizePermissionCode(proof.code) },
        articleIds: { $exists: true, $ne: [] },
        ...buildKnowledgePackAppQuery(appId),
      })
      .sort({ _id: -1 });
    const articleIds = [];
    list.forEach(pack => {
      (pack.articleIds || []).forEach(id => articleIds.push(id));
    });
    const availableArticles = articleIds.length
      ? await article.find({ _id: { $in: articleIds }, code: { $lte: normalizePermissionCode(proof.code) }, isDraft: false }, { _id: 1 })
      : [];
    const availableArticleIds = availableArticles.map(item => String(item._id));
    const availablePacks = list.filter(pack => (pack.articleIds || []).some(id => availableArticleIds.includes(String(id))));
    global.huasen.responseData(res, await buildKnowledgePackDisplayList(availablePacks), 'SUCCESS', '查询知识包列表');
  } catch (err) {
    next(err);
  }
}

async function findUserAppList(req, res, next) {
  try {
    const { proof } = req.huasenJWT;
    const apps = await aiApp.find({ enabled: true, ...buildAppPermissionQuery(proof.code) }).sort({ sort: -1, _id: -1 });
    const presetIds = apps.map(item => resolveAppPresetId(item)).filter(Boolean);
    const providerIds = apps.map(item => item.providerId).filter(Boolean);
    const [presets, providers] = await Promise.all([
      presetIds.length ? aiPreset.find({ _id: { $in: presetIds }, enabled: true }) : Promise.resolve([]),
      providerIds.length ? aiProvider.find({ _id: { $in: providerIds }, enabled: true }) : Promise.resolve([]),
    ]);
    const list = apps.map(item => {
      const selectedPresetId = resolveAppPresetId(item);
      const preset = presets.find(p => String(p._id) === String(selectedPresetId));
      const provider = providers.find(p => String(p._id) === String(item.providerId));
      const supportsTextFallback = resolveProviderCapability(provider, 'supportsTextFallback', true);
      const supportsImageInput = resolveProviderCapability(provider, 'supportsImageInput', false);
      const supportsDocumentInline = resolveProviderCapability(provider, 'supportsDocumentInline', false);
      return {
        ...normalizeAppRecord(item),
        allowImage: Boolean(preset && preset.allowImage && (supportsImageInput || supportsTextFallback)),
        allowFile: Boolean(preset && preset.allowFile && (supportsDocumentInline || supportsTextFallback)),
        acceptImageTypes: preset && preset.allowImage ? preset.acceptImageTypes || [] : [],
        acceptFileTypes: preset && preset.allowFile ? preset.acceptFileTypes || [] : [],
      };
    });
    global.huasen.responseData(res, list, 'SUCCESS', '查询AI应用列表');
  } catch (err) {
    next(err);
  }
}

async function createConversation(req, res, next) {
  try {
    const { proof } = req.huasenJWT;
    const { appId, presetId, title, source, knowledgePackIds = [] } = req.huasenParams;
    const app = await aiApp.findOne({ _id: appId, enabled: true, ...buildAppPermissionQuery(proof.code) });
    if (!app) {
      return global.huasen.responseData(res, null, 'ERROR', '请排查AI应用是否存在/是否禁用/是否无权限');
    }
    const availableKnowledgePackIds = await resolveAvailableKnowledgePackIds({ userCode: proof.code, appId, knowledgePackIds });
    const params = {
      userId: proof.key,
      appId,
      presetId: presetId || resolveAppPresetId(app) || '',
      knowledgePackIds: availableKnowledgePackIds,
      title: sanitizeText(title || '新会话') || '新会话',
      summary: '',
      source: normalizeConversationSource(source),
      lastMessageAt: new Date(),
      messageCount: 0,
      enabled: true,
    };
    const result = await aiConversation.insertMany(params);
    global.huasen.responseData(res, result, 'SUCCESS', '创建会话');
  } catch (err) {
    next(err);
  }
}

async function findConversationByPage(req, res, next) {
  try {
    const { proof } = req.huasenJWT;
    const { pageNo = 1, pageSize = 10, appId, title, source } = req.huasenParams;
    const query = { userId: proof.key, enabled: true };
    if (source) {
      query.source = normalizeConversationSource(source);
    } else {
      query.source = { $ne: 'plugin' };
    }
    if (appId) {
      query.appId = appId;
    }
    buildRegexQuery(query, 'title', title);
    const realPageNo = Number(pageNo) || 1;
    const realPageSize = Number(pageSize) || 10;
    const [list, total] = await Promise.all([
      aiConversation
        .find(query)
        .sort({ lastMessageAt: -1, _id: -1 })
        .limit(realPageSize)
        .skip((realPageNo - 1) * realPageSize),
      aiConversation.countDocuments(query),
    ]);
    global.huasen.responseData(res, { list: await buildConversationDisplayList(list), total }, 'SUCCESS', '分页查询会话');
  } catch (err) {
    next(err);
  }
}

async function findManageConversationByPage(req, res, next) {
  try {
    const { pageNo = 1, pageSize = 10, userId, appId, title, source, creatTime } = req.huasenParams;
    const query = {};
    buildRegexQuery(query, 'userId', userId);
    buildRegexQuery(query, 'title', title);
    if (appId) {
      query.appId = appId;
    }
    if (source) {
      query.source = source;
    }
    if (Array.isArray(creatTime) && creatTime.length === 2) {
      query.creatTime = {
        $gte: new Date(creatTime[0]),
        $lte: new Date(creatTime[1]),
      };
    }
    const realPageNo = Number(pageNo) || 1;
    const realPageSize = Number(pageSize) || 10;
    const [list, total] = await Promise.all([
      aiConversation
        .find(query)
        .sort({ lastMessageAt: -1, _id: -1 })
        .limit(realPageSize)
        .skip((realPageNo - 1) * realPageSize),
      aiConversation.countDocuments(query),
    ]);
    global.huasen.responseData(res, { list: await buildConversationDisplayList(list), total }, 'SUCCESS', '分页查询会话');
  } catch (err) {
    next(err);
  }
}

async function removeConversation(req, res, next) {
  try {
    const { proof } = req.huasenJWT;
    const { _id } = req.huasenParams;
    const conversation = await aiConversation.findOne({ _id, userId: proof.key, enabled: true });
    if (!conversation) {
      return global.huasen.responseData(res, null, 'ERROR', '会话不存在');
    }
    const result = await aiConversation.deleteOne({ _id });
    await Promise.all([aiMessage.deleteMany({ conversationId: _id }), aiAttachment.deleteMany({ conversationId: _id })]);
    global.huasen.responseData(res, result, 'SUCCESS', '删除会话');
  } catch (err) {
    next(err);
  }
}

async function removeManageConversation(req, res, next) {
  try {
    const { _id } = req.huasenParams;
    if (!_id) {
      return global.huasen.responseData(res, null, 'ERROR', '会话ID不能为空');
    }
    const result = await aiConversation.deleteOne({ _id });
    await Promise.all([aiMessage.deleteMany({ conversationId: _id }), aiAttachment.deleteMany({ conversationId: _id })]);
    global.huasen.responseData(res, result, 'SUCCESS', '删除会话');
  } catch (err) {
    next(err);
  }
}

async function removeManyManageConversation(req, res, next) {
  try {
    const ids = normalizeStringArray(req.huasenParams._ids || req.huasenParams.ids);
    if (!ids.length) {
      return global.huasen.responseData(res, null, 'ERROR', '会话ID不能为空');
    }
    const result = await aiConversation.deleteMany({ _id: { $in: ids } });
    await Promise.all([aiMessage.deleteMany({ conversationId: { $in: ids } }), aiAttachment.deleteMany({ conversationId: { $in: ids } })]);
    global.huasen.responseData(res, result, 'SUCCESS', '批量删除会话');
  } catch (err) {
    next(err);
  }
}

async function removeMessages(req, res, next) {
  try {
    const { proof } = req.huasenJWT;
    const { userMessageId, assistantMessageId } = req.huasenParams;
    const messageIds = [userMessageId, assistantMessageId].filter(Boolean);
    if (messageIds.length === 0) {
      return global.huasen.responseData(res, null, 'ERROR', '消息ID不能为空');
    }
    // 查找消息并校验归属
    const messages = await aiMessage.find({ _id: { $in: messageIds }, enabled: true });
    if (messages.length === 0) {
      return global.huasen.responseData(res, null, 'ERROR', '消息不存在');
    }
    const conversationId = messages[0].conversationId;
    // 校验会话归属
    const conversation = await aiConversation.findOne({ _id: conversationId, userId: proof.key, enabled: true });
    if (!conversation) {
      return global.huasen.responseData(res, null, 'ERROR', '会话不存在');
    }
    // 软删除消息
    await aiMessage.updateMany({ _id: { $in: messageIds } }, { $set: { enabled: false } });
    // 将会话消息数减2，更新最后消息时间为倒数第3条消息
    const remaining = await aiMessage.find({ conversationId, enabled: true }).sort({ creatTime: -1 }).limit(1);
    const lastMessageAt = remaining.length > 0 ? remaining[0].creatTime : conversation.creatTime;
    await aiConversation.updateOne({ _id: conversationId }, { $inc: { messageCount: -2 }, $set: { lastMessageAt } });
    global.huasen.responseData(res, { deleted: messageIds.length }, 'SUCCESS', '删除消息');
  } catch (err) {
    next(err);
  }
}

async function findMessageByConversation(req, res, next) {
  try {
    const { proof } = req.huasenJWT;
    const { conversationId } = req.huasenParams;
    const conversation = await aiConversation.findOne({ _id: conversationId, userId: proof.key, enabled: true });
    if (!conversation) {
      return global.huasen.responseData(res, null, 'ERROR', '会话不存在');
    }
    const messages = await aiMessage.find({ conversationId, enabled: true }).sort({ creatTime: 1, _id: 1 });
    const attachmentIds = messages.reduce((result, item) => result.concat(item.attachmentIds || []), []);
    const attachments = attachmentIds.length ? await aiAttachment.find({ _id: { $in: attachmentIds }, enabled: true }) : [];
    const list = messages.map(item => {
      const currentAttachments = attachments.filter(attachment => (item.attachmentIds || []).includes(String(attachment._id)));
      const obj = item.toObject();
      // 将 usage 字符串解析为对象
      if (typeof obj.usage === 'string') {
        try {
          obj.usage = JSON.parse(obj.usage);
        } catch (err) {
          obj.usage = {};
        }
      }
      return {
        ...obj,
        attachments: currentAttachments,
      };
    });
    global.huasen.responseData(res, list, 'SUCCESS', '查询会话消息');
  } catch (err) {
    next(err);
  }
}

async function findManageMessageByConversation(req, res, next) {
  try {
    const { conversationId } = req.huasenParams;
    if (!conversationId) {
      return global.huasen.responseData(res, null, 'ERROR', '会话ID不能为空');
    }
    const messages = await aiMessage.find({ conversationId }).sort({ creatTime: 1, _id: 1 });
    const attachmentIds = messages.reduce((result, item) => result.concat(item.attachmentIds || []), []);
    const attachments = attachmentIds.length ? await aiAttachment.find({ _id: { $in: attachmentIds } }) : [];
    const list = messages.map(item => {
      const obj = item.toObject();
      const currentAttachments = attachments.filter(attachment => (obj.attachmentIds || []).includes(String(attachment._id)));
      return {
        ...obj,
        attachments: currentAttachments,
      };
    });
    global.huasen.responseData(res, list, 'SUCCESS', '查询会话消息');
  } catch (err) {
    next(err);
  }
}

function uploadAttachment(req, res, next) {
  const { proof } = req.huasenJWT;
  const uploadPath = path.resolve(process.cwd(), '../huasen-store/ai');
  const mixtureUpload = new MixtureUpload({
    uploadPath,
    handleFileName: file => {
      const names = file.originalFilename.split('.');
      names.pop();
      return `${names.join('').replaceAll(' ', '_') || 'ai-file'}-${getTime(true)}`;
    },
    onSuccess: async (data, files) => {
      try {
        let resultFiles = [];
        Object.values(files).forEach(item => {
          if (Array.isArray(item)) {
            resultFiles = resultFiles.concat(item);
          } else {
            resultFiles.push(item);
          }
        });
        const docs = resultFiles.map(item => {
          const relativePath = item.path.split(/\/|\\/).slice(-3).join('/');
          const mimeType = _.get(item, 'headers.content-type', '');
          const kind = /^image\//.test(mimeType) ? 'image' : 'file';
          return {
            userId: proof.key,
            conversationId: '',
            messageId: '',
            name: item.originalFilename,
            path: relativePath,
            url: `/${relativePath}`,
            mimeType,
            size: Number(item.size) || 0,
            ext: path.extname(item.originalFilename || '').toLowerCase(),
            kind,
            enabled: true,
          };
        });
        const result = docs.length ? await aiAttachment.insertMany(docs) : [];
        global.huasen.responseData(res, result, 'SUCCESS', '上传AI附件');
      } catch (err) {
        next(err);
      }
    },
    onError: err => {
      global.huasen.responseData(res, {}, 'ERROR', err.msg || '上传AI附件异常');
    },
  });
  mixtureUpload.uploader(req, res, next);
}

function writeSSE(res, event, data) {
  if (res.writableEnded) return;
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data || {})}\n\n`);
}

async function userChatStream(req, res, next) {
  const { proof } = req.huasenJWT;
  const { appId, presetId, conversationId, content = '', attachmentIds = [], knowledgePackIds = [], requestParams = {}, source } = req.huasenParams;
  // 防止 XSS 攻击（跨站脚本攻击）
  if (!sanitizeText(content)) {
    res.status(400);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    writeSSE(res, 'error', { message: '消息内容不能为空', code: 'EMPTY_MESSAGE', retryable: false });
    res.end();
    return;
  }
  res.status(200);
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  // 立即发送响应头
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }
  let abortStream = null;
  let aborted = false;
  let cleaned = false;
  // 定时发送ping报文
  const pingTimer = setInterval(() => {
    writeSSE(res, 'ping', { time: Date.now() });
  }, 12000);

  // 取消监听事件
  const cleanup = reason => {
    if (cleaned) return;
    cleaned = true;
    clearInterval(pingTimer);
    req.off('aborted', handleReqAborted);
    res.off('close', handleResClose);
    res.off('finish', handleFinish);
  };
  const handleFinish = () => {
    cleanup('finish');
  };
  const handleReqAborted = () => handleAbort('req.aborted');
  const handleResClose = () => handleAbort('res.close');
  // 来自客户端的取消事件处理
  const handleAbort = eventName => {
    aborted = true;
    if (typeof abortStream === 'function') {
      abortStream('disconnect');
      abortStream = null;
    }
    cleanup(eventName);
  };
  req.on('aborted', handleReqAborted);
  res.on('close', handleResClose);
  res.on('finish', handleFinish);
  try {
    await chatStream({
      userId: proof.key,
      userCode: proof.code,
      appId,
      presetId,
      conversationId,
      content,
      attachmentIds: Array.isArray(attachmentIds) ? attachmentIds : [],
      knowledgePackIds: Array.isArray(knowledgePackIds) ? knowledgePackIds : [],
      requestParams: Object.prototype.toString.call(requestParams) === '[object Object]' ? requestParams : {},
      source: normalizeConversationSource(source),
      registerAbort(abort) {
        abortStream = abort;
      },
      // 检查客户端的请求是否已取消、响应、销毁
      isAborted() {
        return aborted || res.writableEnded || res.destroyed;
      },
      onAck(payload) {
        writeSSE(res, 'ack', payload);
      },
      onConversation(payload) {
        writeSSE(res, 'conversation', payload);
      },
      onDelta(payload) {
        writeSSE(res, 'delta', payload);
      },
      onDone(payload) {
        writeSSE(res, 'done', payload);
      },
      onError(payload) {
        writeSSE(res, 'error', payload);
      },
    });
  } catch (err) {
    if (!res.writableEnded) {
      if (err.code !== 'USER_STOPPED') {
        writeSSE(res, 'error', {
          message: err.message || 'AI对话异常',
          code: 'STREAM_FAILED',
          retryable: false,
        });
      }
    }
  } finally {
    cleanup('finally');
    if (!res.writableEnded) {
      res.end();
    }
  }
}

async function userChat(req, res, next) {
  try {
    const { proof } = req.huasenJWT;
    const { appId, presetId, conversationId, content = '', attachmentIds = [], knowledgePackIds = [], requestParams = {}, source } = req.huasenParams;
    if (!sanitizeText(content) && (!Array.isArray(attachmentIds) || attachmentIds.length === 0)) {
      return global.huasen.responseData(res, null, 'ERROR', '消息内容不能为空');
    }
    const result = await chat({
      userId: proof.key,
      userCode: proof.code,
      appId,
      presetId,
      conversationId,
      content,
      attachmentIds: Array.isArray(attachmentIds) ? attachmentIds : [],
      knowledgePackIds: Array.isArray(knowledgePackIds) ? knowledgePackIds : [],
      requestParams: Object.prototype.toString.call(requestParams) === '[object Object]' ? requestParams : {},
      source: normalizeConversationSource(source),
    });
    global.huasen.responseData(res, result, 'SUCCESS', 'AI对话成功');
  } catch (err) {
    global.huasen.responseData(res, null, 'ERROR', err.message || 'AI对话异常');
  }
}

/**
 * 获取文件上传允许的类型列表
 */
async function getAcceptTypes(req, res, next) {
  try {
    const acceptTypes = config.STORE.acceptTypes || {};
    global.huasen.responseData(res, acceptTypes, 'SUCCESS', '查询文件类型列表');
  } catch (err) {
    next(err);
  }
}

/**
 * 获取 AI 插件加载所需数据
 * POST /ai/plugin/status
 */
async function pluginStatus(req, res, next) {
  try {
    const domain = getRequestDomain(req);
    const fingerprint = getInstanceFingerprint();

    if (!fingerprint) {
      return global.huasen.responseData(
        res,
        formatPluginStatusPayload({
          authorized: false,
          reason: 'NO_FINGERPRINT',
        }),
        'SUCCESS',
        '实例指纹不可用',
      );
    }

    const { sourceData, abilities } = await getLocalPluginSnapshot();
    const sourceHash = createPluginSourceHash(sourceData);
    const abilityHash = createAbilityHash(abilities || []);
    const licenseResult = await findAvailableLicense(domain, fingerprint, {
      req,
      feature: 'ai-plugin',
      features: ['ai-plugin'],
      sourceVersion: sourceData ? sourceData.version || '' : '',
      sourceHash,
      abilityHash,
    });
    const validLicense = licenseResult.licenseRecord;

    if (!validLicense) {
      const reason = _.get(licenseResult, 'result.reason') || 'LICENSE_NOT_FOUND';
      return global.huasen.responseData(
        res,
        formatPluginStatusPayload({
          authorized: false,
          reason,
          message: getLicenseReasonMessage(reason, '未授权'),
        }),
        'SUCCESS',
        getLicenseReasonMessage(reason, '未授权'),
      );
    }

    return global.huasen.responseData(
      res,
      formatPluginStatusPayload({
        authorized: true,
        licenseRecord: validLicense,
        sourceData,
        abilities,
      }),
      'SUCCESS',
      '查询AI插件数据成功',
    );
  } catch (err) {
    next(err);
  }
}

/**
 * 查询全部能力列表
 */
async function findAbilityByList(req, res, next) {
  try {
    const [err, abilities] = await req.working([{ schemaName: 'aiAbility', methodName: 'find', payloads: [{}] }]);
    if (err) return next(err);
    return global.huasen.responseData(res, abilities || [], 'SUCCESS', '请求成功');
  } catch (err) {
    next(err);
  }
}

/**
 * 分页查询能力列表
 */
async function findAbilityByPage(req, res, next) {
  try {
    const { pageNo, pageSize, name, enabled } = req.huasenParams;
    const query = {};
    buildRegexQuery(query, 'name', name);
    const enabledValue = normalizeBoolean(enabled);
    if (typeof enabledValue === 'boolean') {
      query.enabled = enabledValue;
    }

    const [err, data] = await req.working([
      {
        schemaName: 'aiAbility',
        methodName: 'findByPage',
        payloads: [query, pageNo, pageSize],
        self: true,
      },
    ]);
    if (err) {
      return global.huasen.responseData(res, null, 'ERROR', '分页查询AI能力异常');
    }

    return global.huasen.responseData(res, data, 'SUCCESS', '分页查询AI能力');
  } catch (err) {
    next(err);
  }
}

/**
 * 开源版仅可编辑 appId、defaultResponseFormat、defaultPrompt，官方闭源版允许编辑完整能力配置。
 */
async function updateAbility(req, res, next) {
  try {
    const params = req.huasenParams;
    const { _id } = params;
    if (!_id) {
      return global.huasen.responseData(res, null, 'ERROR', '缺少 _id 参数');
    }

    const updateData = {};
    const editableKeys = hasClosedSourceAbilityManage
      ? ['abilityCode', 'name', 'icon', 'appId', 'defaultResponseFormat', 'defaultPrompt', 'enabled', 'code']
      : ['appId', 'defaultResponseFormat', 'defaultPrompt'];

    editableKeys.forEach(key => {
      if (params[key] !== undefined) updateData[key] = params[key];
    });

    const [err] = await req.working([{ schemaName: 'aiAbility', methodName: 'updateOne', payloads: [{ _id }, updateData] }]);
    if (err) return next(err);

    return global.huasen.responseData(res, null, 'SUCCESS', '更新成功');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  findProviderByList,
  findProviderByPage,
  addProvider,
  updateProvider,
  removeProvider,

  findAppByList,
  findAppByPage,
  addApp,
  updateApp,
  removeApp,

  findPresetByList,
  findPresetByPage,
  addPreset,
  updatePreset,
  removePreset,

  findKnowledgePackByList,
  findKnowledgePackByPage,
  addKnowledgePack,
  updateKnowledgePack,
  removeKnowledgePack,
  findUserKnowledgePackList,

  getAcceptTypes,
  findUserAppList,
  createConversation,
  findConversationByPage,
  findManageConversationByPage,
  removeConversation,
  removeManageConversation,
  removeManyManageConversation,
  removeMessages,
  findMessageByConversation,
  findManageMessageByConversation,
  uploadAttachment,
  userChatStream,
  userChat,

  // AI 插件
  pluginStatus,
  findAbilityByList,
  findAbilityByPage,
  updateAbility,
};

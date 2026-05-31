/*
 * @Autor: huasenjio
 * @Date: 2022-10-10 00:36:28
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-04-25 00:21:58
 * @Description: 站点表控制器
 */
const fs = require('fs');
const _ = require('lodash');
const ExcelJS = require('exceljs');
const { tool } = require('huasen-lib');
const { fetchFavicons } = require('@meltwater/fetch-favicon');
const { MixtureUpload } = require('../plugin/mixture-upload/index.js');
const { downloadAndConvertToBase64 } = require('../utils/tool.js');
const { schemaMap, workingBySeesion } = require('../service/index.js');
const { site, column } = schemaMap;

async function findByPage(req, res, next) {
  let { pageNo, pageSize, name, url, description, remarks, enabled, code, tag, pin } = req.huasenParams;

  let params = {};
  if (name) {
    params.name = { $regex: new RegExp(name, 'i') };
  }
  if (url) {
    params.url = { $regex: new RegExp(url, 'i') };
  }
  if (description) {
    params.description = { $regex: new RegExp(description, 'i') };
  }
  if (remarks) {
    params.remarks = { $regex: new RegExp(remarks, 'i') };
  }
  if (typeof enabled === 'boolean') {
    params.enabled = enabled;
  }
  if (typeof code === 'number') {
    params.code = code;
  }

  // 通过tag或pin关联的站点id取交集
  if (tag) {
    const [site2TagErr, site2TagData] = await req.working([
      {
        schemaName: 'site2tag',
        methodName: 'find',
        payloads: [{ tagId: { $in: [tag] } }],
      },
    ]);
    if (site2TagErr) {
      global.huasen.responseData(res, null, 'ERROR', '查询tag关联站点异常');
    }
    const tagSiteIds = site2TagData.map(item => item.siteId);
    if (Array.isArray(_.get(params, '_id.$in'))) {
      params._id.$in = _.intersection(params._id.$in, tagSiteIds);
    } else {
      _.set(params, '_id.$in', [...tagSiteIds]);
    }
  }
  if (pin) {
    const [site2PinErr, site2PinData] = await req.working([
      {
        schemaName: 'site2pin',
        methodName: 'find',
        payloads: [{ pinId: { $in: [pin] } }],
      },
    ]);
    if (site2PinErr) {
      global.huasen.responseData(res, null, 'ERROR', '查询pin关联站点异常');
    }
    const pinSiteIds = site2PinData.map(item => item.siteId);
    if (Array.isArray(_.get(params, '_id.$in'))) {
      params._id.$in = _.intersection(params._id.$in, pinSiteIds);
    } else {
      _.set(params, '_id.$in', [...pinSiteIds]);
    }
  }

  req.epWorking(
    [
      {
        schemaName: 'site',
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
    siteData => {
      let sites = siteData.list;
      global.huasen.responseData(res, { list: sites, total: siteData.total }, 'SUCCESS', '分页查询站点成功');
    },
  );
}

async function add(req, res, next) {
  const [siteErr, siteData] = await req.working([
    {
      schemaName: 'site',
      methodName: 'insertMany',
      payloads: [req.huasenParams],
    },
  ]);
  if (siteErr || !siteData || siteData.length === 0) {
    return global.huasen.responseData(res, err, 'ERROR', '添加站点异常');
  }
  const site = siteData[0];

  let { site2Column = {}, site2Pin = {}, site2Tag = {} } = req.huasenParams;
  const { bind: bindColumn = [], unbind: unbindColumn = [] } = site2Column;
  const { bind: bindPin = [], unbind: unbindPin = [] } = site2Pin;
  const { bind: bindTag = [], unbind: unbindTag = [] } = site2Tag;
  // 查找当前存在的column、pin、tag，避免建立脏关系
  const [err, cdata, pdata, tdata] = await req.working([
    {
      schemaName: 'column',
      methodName: 'find',
      payloads: [{ _id: { $in: bindColumn } }],
    },
    {
      schemaName: 'pin',
      methodName: 'find',
      payloads: [{ _id: { $in: bindPin } }],
    },
    {
      schemaName: 'tag',
      methodName: 'find',
      payloads: [{ _id: { $in: bindTag } }],
    },
  ]);
  const works = [];
  if (cdata.length > 0) {
    works.push({
      schemaName: 'column2site',
      methodName: 'insertMany',
      payloads: [cdata.map(item => ({ siteId: site._id, columnId: item._id }))],
    });
  }
  if (pdata.length > 0) {
    works.push({
      schemaName: 'site2pin',
      methodName: 'insertMany',
      payloads: [pdata.map(item => ({ siteId: site._id, pinId: item._id }))],
    });
  }
  if (tdata.length > 0) {
    works.push({
      schemaName: 'site2tag',
      methodName: 'insertMany',
      payloads: [tdata.map(item => ({ siteId: site._id, tagId: item._id }))],
    });
  }
  if (!works.length) return global.huasen.responseData(res, site, 'SUCCESS', '添加站点');
  const [bindErr, ...bindResult] = await req.working(works);
  if (bindErr) {
    return global.huasen.responseData(res, bindErr, 'ERROR', '绑定站点关系异常');
  }
  global.huasen.responseData(res, site, 'SUCCESS', '添加站点');
}

function addMany(req, res, next) {
  let { sites } = req.huasenParams;
  if (!Array.isArray(sites)) {
    global.huasen.responseData(res, {}, 'ERROR', '导入数据异常');
  } else {
    req.epWorking(
      [
        {
          schemaName: 'site',
          methodName: 'insertMany',
          payloads: [sites],
        },
      ],
      result => {
        global.huasen.responseData(res, result, 'SUCCESS', '导入站点');
      },
    );
  }
}

function remove(req, res, next) {
  let { _id } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'site',
        methodName: 'deleteOne',
        payloads: [
          {
            _id,
          },
        ],
      },
      {
        schemaName: 'column2site',
        methodName: 'deleteMany',
        payloads: [{ siteId: _id }],
      },
      {
        schemaName: 'site2pin',
        methodName: 'deleteMany',
        payloads: [{ siteId: _id }],
      },
      {
        schemaName: 'site2tag',
        methodName: 'deleteMany',
        payloads: [{ siteId: _id }],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '删除站点');
    },
  );
}

function removeMany(req, res, next) {
  let { _ids } = req.huasenParams;
  if (!Array.isArray(_ids)) {
    global.huasen.responseData(res, {}, 'ERROR', '参数异常');
  } else {
    req.epWorking(
      [
        {
          schemaName: 'site',
          methodName: 'deleteMany',
          payloads: [{ _id: { $in: _ids } }],
        },
      ],
      result => {
        global.huasen.responseData(res, result, 'SUCCESS', '删除站点');
      },
    );
  }
}

async function update(req, res, next) {
  let { _id, site2Column = {}, site2Pin = {}, site2Tag = {} } = req.huasenParams;
  const { bind: bindColumn = [], unbind: unbindColumn = [] } = site2Column;
  const { bind: bindPin = [], unbind: unbindPin = [] } = site2Pin;
  const { bind: bindTag = [], unbind: unbindTag = [] } = site2Tag;
  // 查找当前存在的column、pin、tag，避免建立脏关系
  const [err, cdata, pdata, tdata] = await req.working([
    {
      schemaName: 'column',
      methodName: 'find',
      payloads: [{ _id: { $in: bindColumn } }],
    },
    {
      schemaName: 'pin',
      methodName: 'find',
      payloads: [{ _id: { $in: bindPin } }],
    },
    {
      schemaName: 'tag',
      methodName: 'find',
      payloads: [{ _id: { $in: bindTag } }],
    },
  ]);
  if (err) {
    return global.huasen.responseData(res, null, 'ERROR', '查找关联资源异常');
  }
  const works = [];
  // 绑定
  if (cdata.length) {
    const column2sites = cdata.map(item => ({
      columnId: item._id,
      siteId: _id,
    }));
    works.push({
      schemaName: 'column2site',
      methodName: 'insertMany',
      payloads: [column2sites],
    });
  }
  if (pdata.length) {
    const site2pins = pdata.map(item => ({
      pinId: item._id,
      siteId: _id,
    }));
    works.push({
      schemaName: 'site2pin',
      methodName: 'insertMany',
      payloads: [site2pins],
    });
  }
  if (tdata.length) {
    const site2tags = tdata.map(item => ({
      tagId: item._id,
      siteId: _id,
    }));
    works.push({
      schemaName: 'site2tag',
      methodName: 'insertMany',
      payloads: [site2tags],
    });
  }
  // 解绑
  if (unbindColumn.length) {
    works.push({
      schemaName: 'column2site',
      methodName: 'deleteMany',
      payloads: [{ siteId: _id, columnId: { $in: unbindColumn } }],
    });
  }
  if (unbindPin.length) {
    works.push({
      schemaName: 'site2pin',
      methodName: 'deleteMany',
      payloads: [{ siteId: _id, pinId: { $in: unbindPin } }],
    });
  }
  if (unbindTag.length) {
    works.push({
      schemaName: 'site2tag',
      methodName: 'deleteMany',
      payloads: [{ siteId: _id, tagId: { $in: unbindTag } }],
    });
  }
  works.push({
    schemaName: 'site',
    methodName: 'updateOne',
    payloads: [{ _id }, { $set: req.huasenParams }, { runValidators: true }],
  });
  req.epWorking(works, result => {
    global.huasen.responseData(res, result, 'SUCCESS', '更新站点');
  });
}

// $gt:大于
// $lt:小于
// $gte:大于或等于
// $lte:小于或等于
function findByCode(req, res, next) {
  let { proof } = req.huasenJWT;
  req.epWorking(
    [
      {
        schemaName: 'site',
        methodName: 'find',
        payloads: [
          {
            // 筛选出小于等于用户权限的订阅源
            code: { $lte: proof.code },
            // 可订阅
            enabled: true,
          },
        ],
      },
    ],
    sites => {
      global.huasen.responseData(res, sites, 'SUCCESS', '查询站点');
    },
  );
}

function findByList(req, res, next) {
  req.epWorking(
    [
      {
        schemaName: 'site',
        methodName: 'find',
        payloads: [],
      },
    ],
    sites => {
      global.huasen.responseData(res, sites, 'SUCCESS', '查询站点');
    },
  );
}

async function findSiteTagByList(req, res, next) {
  let { siteId } = req.huasenParams;
  const [s2tErr, bTags = []] = await req.working([
    {
      schemaName: 'site2tag',
      methodName: 'find',
      payloads: [{ siteId }],
    },
  ]);
  if (s2tErr) {
    return global.huasen.responseData(res, null, 'ERROR', '查询站点标签异常');
  }
  let bindTagIds = bTags.map(item => item.tagId);
  const [tErr, tags = []] = await req.working([
    {
      schemaName: 'tag',
      methodName: 'find',
      payloads: [{ _id: { $in: bindTagIds } }],
    },
  ]);
  if (tErr) {
    return global.huasen.responseData(res, null, 'ERROR', '查询标签异常');
  }
  global.huasen.responseData(res, tags, 'SUCCESS', '查询站点标签');
}

async function findSiteColumnByList(req, res, next) {
  let { siteId } = req.huasenParams;
  const [c2sErr, bindColumns = []] = await req.working([
    {
      schemaName: 'column2site',
      methodName: 'find',
      payloads: [{ siteId }],
    },
  ]);
  if (c2sErr) {
    return global.huasen.responseData(res, null, 'ERROR', '查询站点绑定栏目异常');
  }
  let bindColumnIds = bindColumns.map(item => item.columnId);
  const [cErr, columns = []] = await req.working([
    {
      schemaName: 'column',
      methodName: 'find',
      payloads: [{ _id: { $in: bindColumnIds } }],
    },
  ]);
  if (cErr) {
    return global.huasen.responseData(res, null, 'ERROR', '查询栏目异常');
  }
  global.huasen.responseData(res, columns, 'SUCCESS', '查询站点绑定栏目');
}

async function findSitePinByList(req, res, next) {
  let { siteId } = req.huasenParams;
  const [s2pErr, bPins = []] = await req.working([
    {
      schemaName: 'site2pin',
      methodName: 'find',
      payloads: [{ siteId }],
    },
  ]);
  if (s2pErr) {
    return global.huasen.responseData(res, null, 'ERROR', '查询站点绑定标记异常');
  }
  let bindPinIds = bPins.map(item => item.pinId);
  const [pErr, pins = []] = await req.working([
    {
      schemaName: 'pin',
      methodName: 'find',
      payloads: [{ _id: { $in: bindPinIds } }],
    },
  ]);
  if (pErr) {
    return global.huasen.responseData(res, null, 'ERROR', '查询标记异常');
  }
  global.huasen.responseData(res, pins, 'SUCCESS', '查询站点绑定标记');
}

function bindColumn(req, res, next) {
  let { columnId, sites } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'site',
        methodName: 'find',
        payloads: [{ _id: { $in: sites } }],
      },
    ],
    async list => {
      try {
        if (list.length) {
          let bulkUpdates = [];
          // 遍历合入站点数据
          list.forEach(item => {
            try {
              let expand = JSON.parse(item.expand);
              expand.columnStore = expand.columnStore || [];
              // 判断是否需要绑定
              if (expand.columnStore.indexOf(columnId) === -1) {
                expand.columnStore.push(columnId);
              }
              bulkUpdates.push({
                updateOne: {
                  filter: { _id: item._id },
                  update: { $set: { expand: JSON.stringify(expand) } },
                },
              });
            } catch (err) {
              global.huasen.responseData(res, {}, 'ERROR', '数据异常');
            }
          });
          let updateResult = await site.bulkWrite(bulkUpdates);
          global.huasen.responseData(res, updateResult, 'SUCCESS', '链接已绑定栏目');
        }
      } catch (err) {}
    },
  );
}

function unbindColumn(req, res, next) {
  let { columnId, sites } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'site',
        methodName: 'find',
        payloads: [{ _id: { $in: sites } }],
      },
    ],
    async list => {
      try {
        if (list.length) {
          let bulkUpdates = [];
          // 遍历合入站点数据
          list.forEach(item => {
            try {
              let expand = JSON.parse(item.expand);
              expand.columnStore = expand.columnStore || [];
              expand.columnStore = expand.columnStore.filter(el => el !== columnId);
              bulkUpdates.push({
                updateOne: {
                  filter: { _id: item._id },
                  update: { $set: { expand: JSON.stringify(expand) } },
                },
              });
            } catch (err) {
              global.huasen.responseData(res, {}, 'ERROR', '数据异常');
            }
          });
          let updateResult = await site.bulkWrite(bulkUpdates);
          global.huasen.responseData(res, updateResult, 'SUCCESS', '链接已解绑栏目');
        }
      } catch (err) {}
    },
  );
}

function normalizeBoolean(value, defaultValue = true) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return defaultValue;
}

function splitImportCell(value) {
  if (!value) return [];
  return value
    .toString()
    .split(/[;；]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function getCellText(value) {
  return typeof value === 'object' && value ? value.text : value;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForReadableFile(filePath, timeout = 5000) {
  const startedAt = Date.now();
  let lastSize = -1;
  let stableCount = 0;
  while (Date.now() - startedAt < timeout) {
    if (filePath && fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      if (stat.size > 0 && stat.size === lastSize) {
        stableCount++;
        if (stableCount >= 2) return;
      } else {
        stableCount = 0;
        lastSize = stat.size;
      }
    }
    await sleep(80);
  }
  throw new Error(`上传文件尚未写入完成：${filePath}`);
}

function buildImportRefs(ids, names) {
  const idList = splitImportCell(ids);
  const nameList = splitImportCell(names);
  const length = Math.max(idList.length, nameList.length);
  const refs = [];
  for (let i = 0; i < length; i++) {
    refs.push({
      _id: idList[i],
      name: nameList[i],
    });
  }
  return refs.filter(item => item._id || item.name);
}

function normalizeImportRefList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map(item => {
      if (typeof item === 'string') return { _id: item };
      if (item && typeof item === 'object') {
        return {
          _id: item._id || item.id || item.value || item.key,
          name: item.name || item.label,
          description: item.description,
          code: item.code,
          enabled: item.enabled,
          order: item.order,
        };
      }
      return null;
    })
    .filter(item => item && (item._id || item.name));
}

function normalizeImportSiteItem(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    _id: raw._id,
    name: raw.name,
    url: getCellText(raw.url),
    code: Number.isNaN(Number(raw.code)) ? 0 : Number(raw.code),
    enabled: normalizeBoolean(raw.enabled, true),
    icon: getCellText(raw.icon) || '',
    description: raw.description || '',
    remarks: raw.remarks || '',
    pv: Number.isNaN(Number(raw.pv)) ? 0 : Number(raw.pv),
    detail: raw.detail || '',
    expand: raw.expand || '{}',
    siteTag: normalizeImportRefList(raw.siteTag),
    sitePin: normalizeImportRefList(raw.sitePin),
    siteColumn: normalizeImportRefList(raw.siteColumn),
  };
}

function parseExcelSiteItems(worksheet) {
  const items = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= 1) return;
    const rowData = row.values;
    const site = normalizeImportSiteItem({
      _id: rowData[1] || undefined,
      name: rowData[2],
      url: rowData[3],
      code: rowData[4],
      enabled: rowData[5],
      icon: rowData[6],
      description: rowData[7],
      remarks: rowData[8],
      pv: rowData[9],
      detail: rowData[10],
      expand: rowData[11],
      siteTag: buildImportRefs(rowData[12], rowData[13]),
      sitePin: buildImportRefs(rowData[14], rowData[15]),
      siteColumn: buildImportRefs(rowData[16], rowData[17]).map((item, index) => {
        const descriptions = splitImportCell(rowData[18]);
        const codes = splitImportCell(rowData[19]);
        const enableds = splitImportCell(rowData[20]);
        const orders = splitImportCell(rowData[21]);
        return {
          ...item,
          description: descriptions[index] || '',
          code: codes[index],
          enabled: enableds[index],
          order: orders[index],
        };
      }),
    });
    if (site) items.push(site);
  });
  return items;
}

async function importSiteItems(req, rawItems) {
  const siteItems = (Array.isArray(rawItems) ? rawItems : []).map(normalizeImportSiteItem).filter(Boolean);
  const [err, sites = [], columns = [], pins = [], tags = [], c2s = [], s2p = [], s2t = []] = await req.working([
    {
      schemaName: 'site',
      methodName: 'find',
      payloads: [],
    },
    {
      schemaName: 'column',
      methodName: 'find',
      payloads: [],
    },
    {
      schemaName: 'pin',
      methodName: 'find',
      payloads: [],
    },
    {
      schemaName: 'tag',
      methodName: 'find',
      payloads: [],
    },
    {
      schemaName: 'column2site',
      methodName: 'find',
      payloads: [],
    },
    {
      schemaName: 'site2pin',
      methodName: 'find',
      payloads: [],
    },
    {
      schemaName: 'site2tag',
      methodName: 'find',
      payloads: [],
    },
  ]);
  if (err) {
    throw new Error('查询异常');
  }

  const siteIdMap = {};
  sites.forEach(item => {
    siteIdMap[item._id.toString()] = item;
  });

  const createMetaMaps = list => {
    const idMap = {};
    const nameMap = {};
    list.forEach(item => {
      idMap[item._id.toString()] = item;
      nameMap[item.name] = item;
    });
    return { idMap, nameMap, createdMap: {} };
  };

  const columnMaps = createMetaMaps(columns);
  const pinMaps = createMetaMaps(pins);
  const tagMaps = createMetaMaps(tags);

  const siteInsertSuccessList = [];
  const siteInsertErrorList = [];

  const resolveMeta = async ({ schemaName, maps, ref, defaults = {} }) => {
    const refId = ref && ref._id ? ref._id.toString() : '';
    const refName = ref && ref.name ? ref.name : '';
    if (refId && maps.idMap[refId]) return maps.idMap[refId];
    if (refName && maps.nameMap[refName]) return maps.nameMap[refName];
    if (refName && maps.createdMap[refName]) return maps.createdMap[refName];
    if (!refName) return null;
    const doc = {
      _id: refId || undefined,
      name: refName,
      ...defaults,
    };
    const [insertErr, inserts] = await req.working([
      {
        schemaName,
        methodName: 'insertMany',
        payloads: [[doc]],
      },
    ]);
    if (insertErr || !inserts || !inserts.length) return null;
    const created = inserts[0];
    maps.createdMap[refName] = created;
    maps.idMap[created._id.toString()] = created;
    maps.nameMap[created.name] = created;
    return created;
  };

  const bindOnce = async ({ schemaName, relationList, siteId, targetKey, targetId, extra = {} }) => {
    if (!siteId || !targetId) return;
    if (relationList.some(item => item.siteId === siteId && item[targetKey] === targetId)) return;
    const [insertErr, inserts] = await req.working([
      {
        schemaName,
        methodName: 'insertMany',
        payloads: [[{ siteId, [targetKey]: targetId, ...extra }]],
      },
    ]);
    if (!insertErr && inserts && inserts.length) relationList.push(...inserts);
  };

  for (const rawSite of siteItems) {
    const siteData = normalizeImportSiteItem(rawSite);
    if (!siteData || !siteData.name || !siteData.url) continue;
    if (siteData.code < 0 || siteData.code > 3) continue;
    const relationData = {
      siteTag: siteData.siteTag,
      sitePin: siteData.sitePin,
      siteColumn: siteData.siteColumn,
    };
    delete siteData.siteTag;
    delete siteData.sitePin;
    delete siteData.siteColumn;

    let currentSite = siteData._id && siteIdMap[siteData._id] ? siteIdMap[siteData._id] : null;
    if (!currentSite) {
      const [siteInsertErr, siteInserts] = await req.working([
        {
          schemaName: 'site',
          methodName: 'insertMany',
          payloads: [[siteData]],
        },
      ]);
      if (siteInsertErr || !siteInserts || !siteInserts.length) {
        siteInsertErrorList.push(siteData);
        continue;
      }
      currentSite = siteInserts[0];
      siteIdMap[currentSite._id.toString()] = currentSite;
      siteInsertSuccessList.push(currentSite);
    }

    const siteId = currentSite._id.toString();
    for (const ref of relationData.siteTag) {
      const tag = await resolveMeta({ schemaName: 'tag', maps: tagMaps, ref });
      if (tag && tag._id) {
        await bindOnce({ schemaName: 'site2tag', relationList: s2t, siteId, targetKey: 'tagId', targetId: tag._id.toString() });
      }
    }
    for (const ref of relationData.sitePin) {
      const pin = await resolveMeta({ schemaName: 'pin', maps: pinMaps, ref });
      if (pin && pin._id) {
        await bindOnce({ schemaName: 'site2pin', relationList: s2p, siteId, targetKey: 'pinId', targetId: pin._id.toString() });
      }
    }
    for (const ref of relationData.siteColumn) {
      const columnCode = Number.isNaN(Number(ref.code)) ? 0 : Number(ref.code);
      if (columnCode < 0 || columnCode > 3) continue;
      const column = await resolveMeta({
        schemaName: 'column',
        maps: columnMaps,
        ref,
        defaults: {
          description: ref.description || '',
          code: columnCode,
          enabled: normalizeBoolean(ref.enabled, true),
        },
      });
      if (column && column._id) {
        const order = Number.isNaN(Number(ref.order)) ? 0 : Number(ref.order);
        await bindOnce({ schemaName: 'column2site', relationList: c2s, siteId, targetKey: 'columnId', targetId: column._id.toString(), extra: { order } });
      }
    }
  }

  return { siteInsertSuccessList, siteInsertErrorList };
}

function importSite(req, res, next) {
  if (!req.is('multipart/form-data')) {
    importSiteItems(req, req.huasenParams.sites)
      .then(result => {
        global.huasen.responseData(res, result, 'SUCCESS', '导入站点成功');
      })
      .catch(err => {
        global.huasen.responseData(res, null, 'ERROR', err.message || '导入站点异常');
      });
    return;
  }

  const mixtureUpload = new MixtureUpload({
    onSuccess: async (data, fileMap) => {
      const { file } = fileMap;
      try {
        const workbook = new ExcelJS.Workbook();
        await waitForReadableFile(file.path);
        await workbook.xlsx.readFile(file.path);
        const worksheet = workbook.getWorksheet(1);
        const result = await importSiteItems(req, parseExcelSiteItems(worksheet));
        global.huasen.responseData(res, result, 'SUCCESS', '导入站点成功');
      } catch (err) {
        global.huasen.responseData(res, null, 'ERROR', err.message || '导入站点异常');
      } finally {
        if (file && file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
    },
    onError: err => {
      global.huasen.responseData(res, {}, 'ERROR', err.msg);
    },
  });
  mixtureUpload.uploader(req, res, next);
}

async function exportSite(req, res, next) {
  try {
    const { codes, columns } = req.huasenParams;
    let sites = [];
    let columnList = [];
    let column2siteList = [];
    let colunm2sitePayload = {};
    let columnPayload = {};
    if (Array.isArray(columns) && columns.length) {
      colunm2sitePayload = { columnId: { $in: columns } };
      columnPayload = { _id: { $in: columns } };
    }
    // 查询指定栏目绑定的站点id
    const [c2sErr, column2siteData, columnData] = await req.working([
      {
        schemaName: 'column2site',
        methodName: 'find',
        payloads: [colunm2sitePayload],
      },
      {
        schemaName: 'column',
        methodName: 'find',
        payloads: [columnPayload],
      },
    ]);
    if (c2sErr) {
      global.huasen.responseData(res, null, 'ERROR', '查询栏目关联站点异常');
      return;
    }
    columnList = columnData;
    column2siteList = column2siteData;
    const parmas = {};
    if (Array.isArray(columns) && columns.length) {
      parmas._id = { $in: [...new Set(column2siteList.map(item => item.siteId))] };
    }
    if (Array.isArray(codes) && codes.length) {
      parmas.code = { $in: codes };
    }
    const [siteErr, siteList] = await req.working([
      {
        schemaName: 'site',
        methodName: 'find',
        payloads: [parmas],
      },
    ]);
    if (siteErr) {
      global.huasen.responseData(res, null, 'ERROR', '查询站点异常');
      return;
    }
    sites = siteList;
    // 查询链接关联的pin、tag信息
    const [ptErr, site2pin, site2tag, pinList, tagList] = await req.working([
      {
        schemaName: 'site2pin',
        methodName: 'find',
        payloads: [{ siteId: { $in: sites.map(el => el._id.toString()) } }],
      },
      {
        schemaName: 'site2tag',
        methodName: 'find',
        payloads: [{ siteId: { $in: sites.map(el => el._id.toString()) } }],
      },
      {
        schemaName: 'pin',
        methodName: 'find',
        payloads: [],
      },
      {
        schemaName: 'tag',
        methodName: 'find',
        payloads: [],
      },
    ]);
    if (ptErr) {
      global.huasen.responseData(res, null, 'ERROR', '查询站点关联信息异常');
      return;
    }
    // 构建站点id到pin、tag的映射表，提升性能
    const siteId2PinsMap = {};
    const siteId2TagsMap = {};
    const siteId2ColumnsMap = {};
    const siteId2ColumnOrdersMap = {};

    // 初始化数组
    sites.forEach(site => {
      const siteId = site._id.toString();
      siteId2PinsMap[siteId] = [];
      siteId2TagsMap[siteId] = [];
      siteId2ColumnsMap[siteId] = [];
      siteId2ColumnOrdersMap[siteId] = [];
    });

    // 填充pin关系
    site2pin.forEach(item => {
      const target = pinList.find(el => el._id.toString() === item.pinId);
      if (target && siteId2PinsMap[item.siteId]) {
        siteId2PinsMap[item.siteId].push(target);
      }
    });

    // 填充tag关系
    site2tag.forEach(item => {
      const target = tagList.find(el => el._id.toString() === item.tagId);
      if (target && siteId2TagsMap[item.siteId]) {
        siteId2TagsMap[item.siteId].push(target);
      }
    });

    // 填充column关系
    column2siteList.forEach(item => {
      const target = columnList.find(el => el._id.toString() === item.columnId);
      if (target && siteId2ColumnsMap[item.siteId]) {
        siteId2ColumnsMap[item.siteId].push(target);
        siteId2ColumnOrdersMap[item.siteId].push(item.order || 0);
      }
    });

    // 创建一个工作簿
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');
    // 添加列和行
    worksheet.columns = [
      { header: '网站编号', key: 'siteId', width: 20 }, // 0
      { header: '网站名称', key: 'name', width: 20 }, // 1
      { header: '网站链接', key: 'url', width: 60 }, // 2
      { header: '权限码', key: 'code' }, // 3
      { header: '是否启用', key: 'enabled' }, // 4
      { header: '图标链接', key: 'icon', width: 60 }, // 5
      { header: '描述', key: 'description', width: 20 }, // 6
      { header: '备注', key: 'remarks' }, // 7
      { header: '访问量', key: 'pv' }, // 8
      { header: '详情页', key: 'detail', width: 60, height: 60 }, // 9
      { header: '拓展信息', key: 'expand' }, // 10
      { header: '关联标签编号', key: 'tagId', width: 20 }, // 11
      { header: '关联标签', key: 'tagName', width: 20 }, // 12
      { header: '关联置顶标记编号', key: 'pinId', width: 20 }, // 13
      { header: '关联置顶标记', key: 'pinName' }, // 14
      { header: '关联栏目编号', key: 'columnId', width: 20 }, // 15
      { header: '关联栏目名称', key: 'columnName', width: 20 }, // 16
      { header: '关联栏目描述', key: 'columnDescription', width: 20 }, // 17
      { header: '关联栏目权限码', key: 'columnCode', width: 20 }, // 18
      { header: '关联栏目是否启用', key: 'columnEnabled', width: 20 }, // 19
      { header: '网站关联栏目索引', key: 'columnOrder', width: 20 }, // 20
    ];

    // 处理网站字段，映射xlsx字段
    sites.forEach(site => {
      const siteId = site._id.toString();

      // 获取关系数组
      const pins = siteId2PinsMap[siteId] || [];
      const tags = siteId2TagsMap[siteId] || [];
      const columns = siteId2ColumnsMap[siteId] || [];
      const columnOrders = siteId2ColumnOrdersMap[siteId] || [];

      // 将数组转换为分号分隔的字符串
      site.siteId = siteId;
      site.tagId = tags.map(tag => tag._id.toString()).join(';');
      site.tagName = tags.map(tag => tag.name).join(';');
      site.pinId = pins.map(pin => pin._id.toString()).join(';');
      site.pinName = pins.map(pin => pin.name).join(';');
      site.pv = site.pv || 0;
      site.columnId = columns.map(col => col._id.toString()).join(';');
      site.columnName = columns.map(col => col.name).join(';');
      site.columnDescription = columns.map(col => col.description).join(';');
      site.columnCode = columns.map(col => col.code).join(';');
      site.columnEnabled = columns.map(col => col.enabled).join(';');
      site.columnOrder = columnOrders.join(';');

      worksheet.addRow(site);
    });
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        cell.alignment = { wrapText: true, vertical: 'middle' }; // 设置自动换行
      });
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'sites.xlsx');
    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  } catch (err) {
    console.error('导出站点异常', err);
    global.huasen.responseData(res, null, 'ERROR', '导出站点异常');
  }
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
 * @param {String} siteUrl - 网站链接地址
 */
function getFaviconByUrl(siteUrl) {
  let domain = getDomainFromURL(siteUrl);
  if (!domain) return;
  return `https://favicon.im/${domain}?larger=true`;
}

async function findSiteFavicon(req, res, next) {
  let { url } = req.huasenParams;
  const faviconBase64s = [];
  try {
    const icons = await fetchFavicons(url);
    console.log(`网链 ${url} 推荐图标列表：`, icons);
    for (let i = 0; i < icons.length; i++) {
      try {
        let base64 = await downloadAndConvertToBase64(icons[i].href);
        faviconBase64s.push(base64);
      } catch (err) {
        console.error('下载图片捕获到错误', err);
      }
    }
    const iconUrl = getFaviconByUrl(url);
    if (iconUrl) {
      try {
        let iconUrlBase64 = await downloadAndConvertToBase64(iconUrl);
        faviconBase64s.unshift(iconUrlBase64);
      } catch (err) {
        console.error('下载favicon.im图片捕获到错误', err);
      }
    }
    global.huasen.responseData(res, faviconBase64s, 'SUCCESS', '推荐图标');
  } catch (err) {
    global.huasen.responseData(res, [], 'ERROR', '推荐图标异常');
  }
}

async function findSiteDetail(req, res, next) {
  let { _id } = req.huasenParams;
  let { proof } = req.huasenJWT;
  req.epWorking(
    [
      {
        schemaName: 'site',
        methodName: 'findOne',
        payloads: [
          {
            _id,
            // 筛选出小于等于用户权限的订阅源
            code: { $lte: proof.code },
            // 可订阅
            enabled: true,
          },
        ],
      },
      {
        schemaName: 'site',
        methodName: 'upPV',
        payloads: [_id],
        self: true,
      },
    ],
    site => {
      if (site) {
        global.huasen.responseData(res, site, 'SUCCESS', '查询站点详情');
      } else {
        global.huasen.responseData(res, null, 'ERROR', '站点不存在或权限不足');
      }
    },
  );
}

module.exports = {
  findByPage,
  add,
  update,
  remove,
  findByCode,
  findByList,
  removeMany,
  addMany,
  findSiteTagByList,
  findSiteColumnByList,
  findSitePinByList,
  bindColumn,
  unbindColumn,
  importSite,
  exportSite,
  findSiteFavicon,
  findSiteDetail,
};

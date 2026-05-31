/*
 * @Autor: huasenjio
 * @Date: 2022-10-10 00:36:28
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-24 20:14:28
 * @Description: 订阅表控制器
 */
const { working } = require('../service/index.js');

/**
 * 获取订阅源的栏目及站点
 * @param {string} _id - 订阅源id
 * @param {number} code - 权限码
 * @returns
 */
async function getJournalInformationById(_id, code = 0) {
  const [err, journal, j2cs] = await working([
    {
      schemaName: 'journal',
      methodName: 'findOne',
      payloads: [
        {
          _id,
          code: { $lte: code },
          enabled: true,
        },
      ],
    },
    {
      schemaName: 'journal2column',
      methodName: 'find',
      payloads: [
        {
          journalId: _id,
        },
        {},
        { sort: { order: 1 } },
      ],
    },
  ]);
  if (err || !journal) {
    return null;
  }
  let fullJournal = {
    _id: journal._id.toString(),
    name: journal.name,
    code: journal.code,
    expand: journal.expand,
    creatTime: journal.creatTime,
    updateTime: journal.updateTime,
    series: [],
  };
  if (j2cs.length === 0) {
    return fullJournal;
  }
  const columnIds = j2cs.map(item => item.columnId);
  const [err2, columns, c2ss] = await working([
    {
      schemaName: 'column',
      methodName: 'find',
      payloads: [
        {
          _id: { $in: columnIds },
          enabled: true,
          code: { $lte: code },
        },
      ],
    },
    {
      schemaName: 'column2site',
      methodName: 'find',
      payloads: [
        {
          columnId: { $in: columnIds },
        },
        {},
        { sort: { order: 1 } },
      ],
    },
  ]);
  if (err2) {
    return null;
  }
  const siteIds = Array.from(new Set(c2ss.map(item => item.siteId)));
  if (siteIds.length === 0) {
    return fullJournal;
  }
  const [err3, sites, site2pins, site2tags] = await working([
    {
      schemaName: 'site',
      methodName: 'find',
      payloads: [
        {
          _id: { $in: siteIds },
          code: { $lte: code },
          enabled: true,
        },
      ],
    },
    {
      schemaName: 'site2pin',
      methodName: 'find',
      payloads: [
        {
          siteId: { $in: siteIds },
        },
      ],
    },
    {
      schemaName: 'site2tag',
      methodName: 'find',
      payloads: [
        {
          siteId: { $in: siteIds },
        },
      ],
    },
  ]);
  if (err3) {
    return null;
  }
  const pinIds = Array.from(new Set(site2pins.map(item => item.pinId)));
  const tagIds = Array.from(new Set(site2tags.map(item => item.tagId)));
  const [err4, pins, tags] = await working([
    {
      schemaName: 'pin',
      methodName: 'find',
      payloads: [{ _id: { $in: pinIds } }],
    },
    {
      schemaName: 'tag',
      methodName: 'find',
      payloads: [{ _id: { $in: tagIds } }],
    },
  ]);
  if (err4) {
    return null;
  }
  const sitePinMap = {};
  const siteTagMap = {};
  site2pins.forEach(item => {
    if (!sitePinMap[item.siteId]) sitePinMap[item.siteId] = [];
    sitePinMap[item.siteId].push(item.pinId);
  });
  site2tags.forEach(item => {
    if (!siteTagMap[item.siteId]) siteTagMap[item.siteId] = [];
    siteTagMap[item.siteId].push(item.tagId);
  });
  const pinMap = {};
  pins.forEach(pin => {
    const pinId = pin._id.toString();
    pinMap[pinId] = {
      id: pinId,
      name: pin.name,
      color: pin.color,
      bgColor: pin.bgColor,
    };
  });
  const tagMap = {};
  tags.forEach(tag => {
    tagMap[tag._id.toString()] = tag.name;
  });
  const columnMap = {};
  columns.forEach(column => {
    const columnId = column._id.toString();
    columnMap[columnId] = {
      typeId: columnId,
      typeName: column.name,
      description: column.description,
      banner: column.banner,
      remarks: column.remarks,
      expand: column.expand,
      creatTime: column.creatTime,
      updateTime: column.updateTime,
      sites: [],
    };
  });
  const siteMap = {};
  sites.forEach(site => {
    const siteId = site._id.toString();
    siteMap[siteId] = {
      _id: siteId,
      name: site.name,
      url: site.url,
      icon: site.icon,
      code: site.code,
      expand: site.expand,
      description: site.description,
      remarks: site.remarks,
      detail: site.detail,
      hasDetail: !!site.detail,
      creatTime: site.creatTime,
      updateTime: site.updateTime,
      pins: (sitePinMap[siteId] || []).map(pinId => pinMap[pinId]).filter(Boolean),
      tags: (siteTagMap[siteId] || []).map(tagId => tagMap[tagId]).filter(Boolean),
    };
  });
  columnIds.forEach(columnId => {
    const fullColumn = columnMap[columnId];
    if (fullColumn) {
      fullJournal.series.push(fullColumn);
    }
  });
  c2ss.forEach(c2s => {
    const fullColumn = columnMap[c2s.columnId];
    const site = siteMap[c2s.siteId];
    if (fullColumn && site) {
      fullColumn.sites.push(site);
    }
  });
  return fullJournal;
}

function findByPage(req, res, next) {
  let { pageNo, pageSize, name, enabled, code } = req.huasenParams;
  // 模糊查询参数
  let params = { name: { $regex: new RegExp(name, 'i') } };
  if (typeof enabled === 'boolean') {
    params.enabled = enabled;
  }
  if (code !== '' && code !== undefined && code !== null) {
    params.code = code;
  }
  req.epWorking(
    [
      {
        schemaName: 'journal',
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
      global.huasen.responseData(res, result, 'SUCCESS', '分页查询');
    },
  );
}

function add(req, res, next) {
  req.epWorking(
    [
      {
        schemaName: 'journal',
        methodName: 'insertMany',
        payloads: [req.huasenParams],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '添加订阅源');
    },
  );
}

function remove(req, res, next) {
  let { _id } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'journal',
        methodName: 'deleteOne',
        payloads: [
          {
            _id,
          },
        ],
      },
      {
        schemaName: 'journal2column',
        methodName: 'deleteMany',
        payloads: [
          {
            journalId: _id,
          },
        ],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '删除订阅源');
    },
  );
}

function update(req, res, next) {
  let { _id } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'journal',
        methodName: 'updateOne',
        payloads: [{ _id }, { $set: req.huasenParams }, { runValidators: true }],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '更新订阅源');
    },
  );
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
        schemaName: 'journal',
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
    takes => {
      global.huasen.responseData(res, takes, 'SUCCESS', '查询订阅源');
    },
  );
}

function findAll(req, res, next) {
  const code = req.huasenJWT?.proof?.code || 0;
  req.epWorking(
    [
      {
        schemaName: 'journal',
        methodName: 'find',
        payloads: [
          {
            // 筛选出小于等于用户权限的订阅源
            code: { $lte: code },
            enabled: true,
          },
        ],
      },
    ],
    takes => {
      let temp = takes.map(item => {
        let { _id, name, expand, code } = item;
        return { _id, name, expand, code };
      });
      global.huasen.responseData(res, temp, 'SUCCESS', '查询站点');
    },
  );
}

// 查询订阅源下的栏目和站点
async function findJournalInformationById(req, res, next) {
  let { _id } = req.huasenParams;
  let { proof } = req.huasenJWT;
  const fullJournal = await getJournalInformationById(_id, proof.code);
  if (!fullJournal) {
    return global.huasen.responseData(res, {}, 'ERROR', '订阅源不存在');
  }
  global.huasen.responseData(res, fullJournal, 'SUCCESS', '查询订阅源关联信息');
}

async function findBindedColumn(req, res, next) {
  let { journalId } = req.huasenParams;
  const [cErr, journal2columns] = await req.working([
    {
      schemaName: 'journal2column',
      methodName: 'find',
      payloads: [{ journalId }, {}, { sort: { order: 1 } }],
    },
  ]);
  if (cErr) {
    return global.huasen.responseData(res, null, 'ERROR', '查询绑定栏目');
  }
  let columnIds = journal2columns.map(item => item.columnId);
  const [sErr, columns] = await req.working([
    {
      schemaName: 'column',
      methodName: 'find',
      payloads: [{ _id: { $in: columnIds } }],
    },
  ]);
  if (sErr) {
    return global.huasen.responseData(res, null, 'ERROR', '查询绑定栏目');
  }
  // 创建栏目ID到栏目对象的映射，便于按顺序排列
  const columnMap = {};
  columns.forEach(column => {
    columnMap[column._id] = column;
  });
  const orderedColumns = journal2columns.map(relation => columnMap[relation.columnId]).filter(column => column); // 过滤掉可能不存在的栏目
  global.huasen.responseData(res, { columns: orderedColumns }, 'SUCCESS', '查询绑定栏目');
}

// 解除栏目和站点的关系
async function unbindColumn(req, res, next) {
  let { journalId, columnIds } = req.huasenParams;
  const [cErr, columns] = await req.working([
    {
      schemaName: 'journal2column',
      methodName: 'deleteMany',
      payloads: [{ journalId, columnId: { $in: columnIds } }],
    },
  ]);
  if (cErr) {
    return global.huasen.responseData(res, null, 'ERROR', '取消绑定栏目');
  }
  global.huasen.responseData(res, columns, 'SUCCESS', '取消绑定栏目');
}

async function bindColumn(req, res, next) {
  let { journalId, columnIds } = req.huasenParams;
  // 查询journalId关联的栏目数量，用于判断确定order的起始值
  const [countErr, targetJ2C] = await req.working([
    {
      schemaName: 'journal2column',
      methodName: 'findOne',
      payloads: [{ journalId }],
    },
  ]);
  if (countErr) {
    return global.huasen.responseData(res, null, 'ERROR', '查询绑定栏目关系');
  }
  let startOrder = 0;
  if (targetJ2C?.order) {
    startOrder = targetJ2C.order;
  }
  const [cErr, journal2columns] = await req.working([
    {
      schemaName: 'journal2column',
      methodName: 'insertMany',
      payloads: columnIds.map(columnId => {
        startOrder = startOrder + 1;
        return { journalId, columnId, order: startOrder };
      }),
    },
  ]);
  if (cErr) {
    return global.huasen.responseData(res, null, 'ERROR', '绑定栏目');
  }
  global.huasen.responseData(res, journal2columns, 'SUCCESS', '绑定栏目');
}

// 根据传递的columnIds数组，更新栏目关联站点的顺序
async function updateBindedColumnOrder(req, res, next) {
  let { journalId, columnIds } = req.huasenParams;
  console.log(columnIds);
  // 创建批量更新操作
  const operations = columnIds.map((columnId, index) => ({
    updateOne: {
      filter: { journalId, columnId },
      update: { $set: { order: index } },
    },
  }));
  const [cErr, result] = await req.working([
    {
      schemaName: 'journal2column',
      methodName: 'bulkWrite',
      payloads: [operations],
    },
  ]);
  if (cErr) {
    return global.huasen.responseData(res, null, 'ERROR', '更新绑定栏目顺序失败');
  }
  global.huasen.responseData(res, result, 'SUCCESS', '更新绑定栏目顺序成功');
}

module.exports = {
  findByPage,
  add,
  update,
  remove,
  findByCode,
  findAll,
  findJournalInformationById,
  findBindedColumn,
  updateBindedColumnOrder,
  unbindColumn,
  bindColumn,
  getJournalInformationById,
};

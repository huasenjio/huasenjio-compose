/*
 * @Autor: huasenjio
 * @Date: 2022-10-10 00:36:28
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-17 11:36:21
 * @Description: 栏目表控制器
 */

const { column } = require('../service/index.js').schemaMap;

function findByPage(req, res, next) {
  let { pageNo, pageSize, name, description, remarks, enabled, code } = req.huasenParams;
  let params = { name: { $regex: new RegExp(name, 'i') } };
  if (description) {
    params.description = { $regex: new RegExp(description, 'i') };
  }
  if (remarks) {
    params.remarks = { $regex: new RegExp(remarks, 'i') };
  }
  if (typeof enabled === 'boolean') {
    params.enabled = enabled;
  }
  if (code !== '' && code !== undefined && code !== null) {
    params.code = code;
  }
  req.epWorking(
    [
      {
        schemaName: 'column',
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
  let { column } = { ...req.huasenParams };
  req.epWorking(
    [
      {
        schemaName: 'column',
        methodName: 'insertMany',
        payloads: [column],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '添加栏目');
    },
  );
}

// 删除栏目，并且删除栏目关联的站点
function remove(req, res, next) {
  let { _id } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'column',
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
        payloads: [
          {
            columnId: _id,
          },
        ],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '删除栏目');
    },
  );
}

function update(req, res, next) {
  let { _id } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'column',
        methodName: 'updateOne',
        payloads: [{ _id }, { $set: req.huasenParams }, { runValidators: true }],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '更新栏目');
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
        schemaName: 'column',
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
    columns => {
      global.huasen.responseData(res, columns, 'SUCCESS', '查询栏目');
    },
  );
}

function findByList(req, res, next) {
  req.epWorking(
    [
      {
        schemaName: 'column',
        methodName: 'find',
        payloads: [],
      },
    ],
    columns => {
      global.huasen.responseData(res, columns, 'SUCCESS', '查询栏目');
    },
  );
}

// 查询栏目关联站点，根据order排序站点后，返回站点列表
async function findBindedSite(req, res, next) {
  let { columnId } = req.huasenParams;
  const [cErr, c2s] = await req.working([
    {
      schemaName: 'column2site',
      methodName: 'find',
      payloads: [{ columnId }, {}, { sort: { order: 1 } }],
    },
  ]);
  if (cErr) {
    return global.huasen.responseData(res, null, 'ERROR', '查询栏目关联站点失败');
  }
  let siteIds = c2s.map(item => item.siteId);
  const [sErr, sites] = await req.working([
    {
      schemaName: 'site',
      methodName: 'find',
      payloads: [{ _id: { $in: siteIds } }],
    },
  ]);
  if (sErr) {
    return global.huasen.responseData(res, null, 'ERROR', '查询站点失败');
  }
  // 创建站点ID到站点对象的映射，便于按顺序排列
  const siteMap = {};
  sites.forEach(site => {
    siteMap[site._id] = site;
  });
  const orderedSites = c2s.map(relation => siteMap[relation.siteId]).filter(site => site); // 过滤掉可能不存在的站点
  global.huasen.responseData(res, { sites: orderedSites }, 'SUCCESS', '查询栏目关联站点成功');
}

// 解除栏目和站点的关系
async function unbindSite(req, res, next) {
  let { columnId, siteIds } = req.huasenParams;
  const [cErr, columns] = await req.working([
    {
      schemaName: 'column2site',
      methodName: 'deleteMany',
      payloads: [{ columnId, siteId: { $in: siteIds } }],
    },
  ]);
  if (cErr) {
    return global.huasen.responseData(res, null, 'ERROR', '取消绑定站点失败');
  }
  global.huasen.responseData(res, columns, 'SUCCESS', '取消绑定站点成功');
}

// 绑定栏目和站点，从已绑定的关系中，查询最大的order值，用于确定新绑定的站点的order值
async function bindSite(req, res, next) {
  let { columnId, siteIds } = req.huasenParams;
  // 查询columnId关联的站点数量，用于判断确定order的起始值
  const [countErr, targetC2S] = await req.working([
    {
      schemaName: 'column2site',
      methodName: 'findOne',
      payloads: [{ columnId }],
    },
  ]);
  if (countErr) {
    return global.huasen.responseData(res, null, 'ERROR', '查询栏目和站点关系失败');
  }
  let startOrder = 0;
  if (targetC2S?.order) {
    startOrder = targetC2S.order;
  }
  const [cErr, columns] = await req.working([
    {
      schemaName: 'column2site',
      methodName: 'insertMany',
      payloads: siteIds.map(siteId => {
        startOrder = startOrder + 1;
        return { columnId, siteId, order: startOrder };
      }),
    },
  ]);
  if (cErr) {
    return global.huasen.responseData(res, null, 'ERROR', '绑定站点失败');
  }
  global.huasen.responseData(res, columns, 'SUCCESS', '绑定站点成功');
}

// 根据传递的siteIds数组，更新栏目关联站点的顺序
async function updateBindedSiteOrder(req, res, next) {
  let { columnId, siteIds } = req.huasenParams;
  // 创建批量更新操作
  const operations = siteIds.map((siteId, index) => ({
    updateOne: {
      filter: { columnId, siteId },
      update: { $set: { order: index } },
    },
  }));
  const [cErr, result] = await req.working([
    {
      schemaName: 'column2site',
      methodName: 'bulkWrite',
      payloads: [operations],
    },
  ]);
  if (cErr) {
    return global.huasen.responseData(res, null, 'ERROR', '更新绑定站点顺序失败');
  }
  global.huasen.responseData(res, result, 'SUCCESS', '更新绑定站点顺序成功');
}

module.exports = {
  findByPage,
  add,
  update,
  remove,
  findByCode,
  findByList,
  findBindedSite,
  unbindSite,
  bindSite,
  updateBindedSiteOrder,
};

async function findByList(req, res, next) {
  const [err, data] = await req.working([
    {
      schemaName: 'pin',
      methodName: 'find',
      payloads: [],
    },
  ]);
  if (err) {
    return global.huasen.responseData(res, null, 'ERROR', '查询置顶标记列表异常');
  }
  global.huasen.responseData(res, data, 'SUCCESS', '查询置顶标记列表');
}

async function findByPage(req, res, next) {
  let { pageNo, pageSize, name } = req.huasenParams;
  let query = {};
  if (name) {
    query.name = { $regex: new RegExp(name, 'i') };
  }
  const [err, data] = await req.working([
    {
      schemaName: 'pin',
      methodName: 'findByPage',
      payloads: [query, pageNo, pageSize],
      self: true,
    },
  ]);
  if (err) {
    return global.huasen.responseData(res, null, 'ERROR', '分页查询置顶标记异常');
  }
  global.huasen.responseData(res, data, 'SUCCESS', '分页查询置顶标记');
}

async function addPin(req, res, next) {
  const [err, data] = await req.working([
    {
      schemaName: 'pin',
      methodName: 'insertMany',
      payloads: [req.huasenParams],
    },
  ]);
  if (err) {
    return global.huasen.responseData(res, null, 'ERROR', '添加置顶标记异常');
  }
  global.huasen.responseData(res, data, 'SUCCESS', '添加置顶标记');
}

async function removePin(req, res, next) {
  let { _id } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'pin',
        methodName: 'deleteOne',
        payloads: [{ _id }],
      },
      {
        schemaName: 'site2pin',
        methodName: 'deleteMany',
        payloads: [{ pinId: _id }],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '删除置顶标记');
    },
  );
}

async function removeManyPins(req, res, next) {
  let { ids } = req.huasenParams;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return global.huasen.responseData(res, null, 'ERROR', '请选择要删除的置顶标记');
  }
  req.epWorking(
    [
      {
        schemaName: 'pin',
        methodName: 'deleteMany',
        payloads: [{ _id: { $in: ids } }],
      },
      {
        schemaName: 'site2pin',
        methodName: 'deleteMany',
        payloads: [{ pinId: { $in: ids } }],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '批量删除置顶标记');
    },
  );
}

async function updatePin(req, res, next) {
  let { _id } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'pin',
        methodName: 'updateOne',
        payloads: [{ _id }, { $set: req.huasenParams }, { runValidators: true }],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '更新置顶标记');
    },
  );
}

module.exports = {
  findByList,
  findByPage,
  addPin,
  removePin,
  removeManyPins,
  updatePin,
};

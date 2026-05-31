async function findByList(req, res, next) {
  const [err, data] = await req.working([
    {
      schemaName: 'tag',
      methodName: 'find',
      payloads: [],
    },
  ]);
  if (err) {
    return global.huasen.responseData(res, null, 'ERROR', '查询标签列表异常');
  }
  global.huasen.responseData(res, data, 'SUCCESS', '查询标签列表');
}

async function findByPage(req, res, next) {
  let { pageNo, pageSize, name } = req.huasenParams;
  let query = {};
  if (name) {
    query.name = { $regex: new RegExp(name, 'i') };
  }
  const [err, data] = await req.working([
    {
      schemaName: 'tag',
      methodName: 'findByPage',
      payloads: [query, pageNo, pageSize],
      self: true,
    },
  ]);
  if (err) {
    return global.huasen.responseData(res, null, 'ERROR', '分页查询标签异常');
  }
  global.huasen.responseData(res, data, 'SUCCESS', '分页查询标签');
}

async function addTag(req, res, next) {
  const [err, data] = await req.working([
    {
      schemaName: 'tag',
      methodName: 'insertMany',
      payloads: [req.huasenParams],
    },
  ]);
  if (err) {
    return global.huasen.responseData(res, null, 'ERROR', '添加标签异常');
  }
  global.huasen.responseData(res, data, 'SUCCESS', '添加标签');
}

async function removeTag(req, res, next) {
  let { _id } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'tag',
        methodName: 'deleteOne',
        payloads: [{ _id }],
      },
      {
        schemaName: 'site2tag',
        methodName: 'deleteMany',
        payloads: [{ tagId: _id }],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '删除标签');
    },
  );
}

async function removeManyTags(req, res, next) {
  let { ids } = req.huasenParams;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return global.huasen.responseData(res, null, 'ERROR', '请选择要删除的标签');
  }
  req.epWorking(
    [
      {
        schemaName: 'tag',
        methodName: 'deleteMany',
        payloads: [{ _id: { $in: ids } }],
      },
      {
        schemaName: 'site2tag',
        methodName: 'deleteMany',
        payloads: [{ tagId: { $in: ids } }],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '批量删除标签');
    },
  );
}

async function updateTag(req, res, next) {
  let { _id } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'tag',
        methodName: 'updateOne',
        payloads: [{ _id }, { $set: req.huasenParams }, { runValidators: true }],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '更新标签');
    },
  );
}

module.exports = {
  findByList,
  findByPage,
  addTag,
  removeTag,
  removeManyTags,
  updateTag,
};

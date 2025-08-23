/*
 * @Autor: huasenjio
 * @Date: 2022-10-29 12:07:17
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-05-14 12:09:29
 * @Description: 日志控制器
 */

function add(req, res, next) {
  req.epWorking(
    [
      {
        schemaName: 'Record',
        methodName: 'insertMany',
        payloads: [req.huasenParams],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '添加记录');
    },
  );
}

function findByPage(req, res, next) {
  let { pageNo, pageSize, id, time } = req.huasenParams;
  let params = { id: { $regex: new RegExp(id, 'i') } };
  if (Array.isArray(time) && time.length === 2) {
    const startTime = new Date(time[0]).toISOString().replace('T', ' ').substring(0, 19);
    const endTime = new Date(time[1]).toISOString().replace('T', ' ').substring(0, 19);
    params.time = {
      $gte: startTime,
      $lte: endTime,
    };
  }
  req.epWorking(
    [
      {
        schemaName: 'Record',
        methodName: 'findByPage',
        payloads: [
          {
            $and: [params],
          },
          pageNo,
          pageSize,
          {
            log: 0,
            __v: 0,
          },
        ],
        self: true,
      },
    ],
    result => {
      const list = result.list;
      const total = result.total;
      // 按时间倒序
      list.sort((a, b) => {
        return new Date(b.time) - new Date(a.time);
      });
      global.huasen.responseData(res, { list, total }, 'SUCCESS', '分页查询记录');
    },
  );
}

function remove(req, res, next) {
  let { _id } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'Record',
        methodName: 'deleteOne',
        payloads: [
          {
            _id,
          },
        ],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '删除记录');
    },
  );
}

function removeMany(req, res, next) {
  let { _ids } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'Record',
        methodName: 'deleteMany',
        payloads: [{ _id: { $in: _ids } }],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '批量删除记录');
    },
  );
}

function copy(req, res, next) {
  let { _id } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'Record',
        methodName: 'find',
        payloads: [{ _id }, { _id: 0, __v: 0 }],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '复制记录');
    },
  );
}

module.exports = {
  add,
  remove,
  findByPage,
  removeMany,
  copy,
};

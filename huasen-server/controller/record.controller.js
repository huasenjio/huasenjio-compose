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
  req.epWorking(
    [
      {
        schemaName: 'Record',
        methodName: 'findByPage',
        payloads: [
          {
            $and: [{ id: { $regex: new RegExp(id, 'i') } }, { time: { $regex: new RegExp(time, 'i') } }],
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
      global.huasen.responseData(res, result, 'SUCCESS', '分页查询记录');
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
  copy
};

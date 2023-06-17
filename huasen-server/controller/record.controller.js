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
      global.huasen.responseData(res, result, 'SUCCESS', '添加记录成功', false);
    },
  );
}

function findAllByPage(req, res, next) {
  let { pageNo, pageSize, id, time } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'Record',
        methodName: 'findAllByPage',
        payloads: [
          {
            $and: [{ id: { $regex: new RegExp(id) } }, { time: { $regex: new RegExp(time) } }],
          },
          pageNo,
          pageSize,
        ],
        self: true,
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '分页查询记录成功', false);
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
      global.huasen.responseData(res, result, 'SUCCESS', '删除记录成功', false);
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
      global.huasen.responseData(res, result, 'SUCCESS', '删除站点成功', false);
    },
  );
}

module.exports = {
  add,
  remove,
  findAllByPage,
  removeMany,
};

/*
 * @Autor: huasenjio
 * @Date: 2022-10-29 12:07:17
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-29 12:43:20
 * @Description: 日志控制器
 */

function add(req, res, next) {
  global.huasen.working(
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
    req,
  );
}

function findAllByPage(req, res, next) {
  let { pageNo, pageSize, id, time } = req.huasenParams;
  global.huasen.working(
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
    req,
  );
}

function remove(req, res, next) {
  let { _id } = req.huasenParams;
  global.huasen.working(
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
    req,
  );
}

module.exports = {
  add,
  remove,
  findAllByPage,
};

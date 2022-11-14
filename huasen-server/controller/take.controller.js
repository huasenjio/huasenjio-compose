/*
 * @Autor: huasenjio
 * @Date: 2022-10-10 00:36:28
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-24 00:17:31
 * @Description: 订阅表控制器
 */

function findAllByPage(req, res, next) {
  let { pageNo, pageSize, name, code } = req.huasenParams;
  // 模糊查询参数
  let params = { name: { $regex: new RegExp(name) } };
  // 处理权限码模糊查询
  if (code !== '' && code !== undefined && code !== null) {
    params.code = code;
  }
  global.huasen.working(
    [
      {
        schemaName: 'Take',
        methodName: 'findAllByPage',
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
      global.huasen.responseData(res, result, 'SUCCESS', '分页查询成功', false);
    },
    req,
  );
}

function add(req, res, next) {
  global.huasen.working(
    [
      {
        schemaName: 'Take',
        methodName: 'insertMany',
        payloads: [req.huasenParams],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '添加订阅成功', false);
    },
    req,
  );
}

function remove(req, res, next) {
  let { _id } = req.huasenParams;
  global.huasen.working(
    [
      {
        schemaName: 'Take',
        methodName: 'deleteOne',
        payloads: [
          {
            _id,
          },
        ],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '删除订阅源成功', false);
    },
    req,
  );
}

function update(req, res, next) {
  let { _id } = req.huasenParams;
  global.huasen.working(
    [
      {
        schemaName: 'Take',
        methodName: 'updateOne',
        payloads: [{ _id }, { $set: req.huasenParams }, { runValidators: true }],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '更新订阅成功', false);
    },
    req,
  );
}

// $gt:大于
// $lt:小于
// $gte:大于或等于
// $lte:小于或等于
function findByCode(req, res, next) {
  let { proof } = req.huasenJWT;
  global.huasen.working(
    [
      {
        schemaName: 'Take',
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
      global.huasen.responseData(res, takes, 'SUCCESS', '查询订阅源成功', false);
    },
    req,
  );
}

module.exports = {
  findAllByPage,
  add,
  update,
  remove,
  findByCode,
};

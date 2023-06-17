/*
 * @Autor: huasenjio
 * @Date: 2022-10-10 00:36:28
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-17 11:36:21
 * @Description: 栏目表控制器
 */

function findAllByPage(req, res, next) {
  let { pageNo, pageSize, name, code } = req.huasenParams;
  // 模糊查询参数
  let params = { name: { $regex: new RegExp(name) } };
  // 处理权限码模糊查询
  if (code !== '' && code !== undefined && code !== null) {
    params.code = code;
  }
  req.epWorking(
    [
      {
        schemaName: 'Column',
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
  );
}

function add(req, res, next) {
  req.epWorking(
    [
      {
        schemaName: 'Column',
        methodName: 'insertMany',
        payloads: [req.huasenParams],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '添加栏目成功', false);
    },
  );
}

function remove(req, res, next) {
  let { _id } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'Column',
        methodName: 'deleteOne',
        payloads: [
          {
            _id,
          },
        ],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '删除栏目成功', false);
    },
  );
}

function update(req, res, next) {
  let { _id } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'Column',
        methodName: 'updateOne',
        payloads: [{ _id }, { $set: req.huasenParams }, { runValidators: true }],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '更新栏目成功', false);
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
        schemaName: 'Column',
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
      global.huasen.responseData(res, takes, 'SUCCESS', '查询栏目成功', false);
    },
  );
}

function findByList(req, res, next) {
  req.epWorking(
    [
      {
        schemaName: 'Column',
        methodName: 'find',
        payloads: [],
      },
    ],
    takes => {
      global.huasen.responseData(res, takes, 'SUCCESS', '查询栏目成功', false);
    },
  );
}

module.exports = {
  findAllByPage,
  add,
  update,
  remove,
  findByCode,
  findByList,
};

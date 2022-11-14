/*
 * @Autor: huasenjio
 * @Date: 2022-10-02 00:26:28
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-24 00:22:52
 * @Description: 新闻接口控制器
 */

function add(req, res, next) {
  global.huasen.working(
    [
      {
        schemaName: 'Article',
        methodName: 'insertMany',
        payloads: [req.huasenParams],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '添加文章成功', false);
    },
    req,
  );
}

function findAllByPage(req, res, next) {
  let { pageNo, pageSize, title, manageId } = req.huasenParams;
  global.huasen.working(
    [
      {
        schemaName: 'Article',
        methodName: 'findAllByPage',
        payloads: [
          {
            $and: [{ title: { $regex: new RegExp(title) } }, { manageId: { $regex: new RegExp(manageId) } }],
          },
          pageNo,
          pageSize,
        ],
        self: true,
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '分页查询文章成功', false);
    },
    req,
  );
}

function findById(req, res, next) {
  let { _id } = req.huasenParams;
  global.huasen.working(
    [
      {
        schemaName: 'Article',
        methodName: 'find',
        payloads: [{ _id }],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '查询文章成功', false);
    },
    req,
  );
}

function remove(req, res, next) {
  let { _id } = req.huasenParams;
  global.huasen.working(
    [
      {
        schemaName: 'Article',
        methodName: 'deleteOne',
        payloads: [
          {
            _id,
          },
        ],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '删除文章成功', false);
    },
    req,
  );
}

function update(req, res, next) {
  let { _id } = req.huasenParams;
  global.huasen.working(
    [
      {
        schemaName: 'Article',
        methodName: 'updateOne',
        payloads: [{ _id }, { $set: req.huasenParams }, { runValidators: true }],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '更新文章成功', false);
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
        schemaName: 'Article',
        methodName: 'find',
        payloads: [
          {
            // 筛选出小于等于用户权限的订阅源
            code: { $lte: proof.code },
            // 不是草稿
            isDraft: false,
          },
        ],
      },
    ],
    articles => {
      global.huasen.responseData(res, articles, 'SUCCESS', '查询文章成功', false);
    },
    req,
  );
}

module.exports = {
  add,
  findAllByPage,
  remove,
  findById,
  update,
  findByCode,
};

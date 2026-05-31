/*
 * @Autor: huasenjio
 * @Date: 2022-10-02 17:21:26
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-13 21:59:05
 * @Description: 服务模版
 */

/**
 * 分页查询
 * @param {mongodbSchema} schema - 模型
 * @param {object} query - 查询条件
 * @param {object} projection - 返回字段
 * @param {number} pageNo - 页码
 * @param {number} pageSize - 页长
 */
async function findByPage(schema, query, pageNo, pageSize, projection) {
  try {
    pageNo = Number(pageNo) || 1;
    pageSize = Number(pageSize) || 10;
    query = query || {};
    projection = projection || {};
    // 跳几条，读几条
    let list = await schema
      .find(query, projection)
      .sort({ _id: -1 })
      .limit(pageSize)
      .skip((pageNo - 1) * pageSize);
    // 查询总数
    let total = await schema.find(query, projection).countDocuments();
    return {
      list,
      total,
    };
  } catch (err) {
    throw err;
  }
}

/**
 * 查询记录总数
 * @param {mongodbSchema} schema - 模型
 * @returns
 */
async function count(schema) {
  try {
    // 查询总数
    let total = await schema.find().countDocuments();
    return total;
  } catch (err) {
    throw err;
  }
}

/**
 * 排序查询
 * @param {mongodbSchema} schema - 模型
 * @param {object} sort - 排序规则，例如：{time: -1}，表示按照时间降序排序；{time: 1}，表示按照时间升序排序
 * @param {number} count - 数量，表示返回记录数量
 * @param {object} query - 查询条件
 * @param {object} projection - 返回字段
 */
async function limit(schema, sort, count, query = {}, projection = {}) {
  try {
    let total = await schema.find(query, projection).sort(sort).limit(count);
    return total;
  } catch (err) {
    throw err;
  }
}

/**
 * 初始化数据，当表为空时，才会插入数据
 * @param {mongodbSchema} schema - 模型
 * @param {string} eventName - 服务名
 * @param {array} data - 初始化数据
 */
async function init(schema, data) {
  try {
    let count = await schema.find().countDocuments();
    if (count === 0) {
      await schema.insertMany(data);
      return data;
    } else {
      return null;
    }
  } catch (err) {
    throw err;
  }
}

/**
 * 累加pv模版，上限为99999999，不存在pv字段时自动创建
 * @param {mongodbSchema} schema - 模型
 * @param {string} _id - 文档id
 */
async function upPV(schema, _id) {
  try {
    let result = await schema.updateOne({ _id }, [
      {
        $set: {
          pv: {
            $min: [
              // 设置上限值
              { $add: [{ $ifNull: ['$pv', 0] }, 1] }, // 处理字段不存在的情况
              99999999,
            ],
          },
        },
      },
    ]);
    return result;
  } catch (err) {
    throw err;
  }
}

// setMethod('findByPage', findByPage);
// setMethod('count', count);
// setMethod('limit', limit);
// setMethod('init', init);
// setMethod('upPV', upPV);

module.exports = {
  findByPage,
  count,
  limit,
  init,
  upPV,
};

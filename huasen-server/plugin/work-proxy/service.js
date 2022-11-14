/*
 * @Autor: huasenjio
 * @Date: 2022-10-02 17:21:26
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-22 18:24:05
 * @Description: 公共的服务模版
 */

// 分页查询
async function findAllByPage(ep, schema, eventName, target, pageId, pageSize) {
  try {
    pageId = Number(pageId) || 1;
    pageSize = Number(pageSize) || 10;
    // 跳过几条读几条
    let list = await schema
      .find(target)
      .limit(pageSize)
      .skip((pageId - 1) * pageSize);
    // 查询总数
    let total = await schema.find(target).countDocuments();
    ep.emit(eventName, {
      list,
      total,
    });
  } catch (err) {
    ep.emit('error', err);
  }
}

async function count(ep, schema, eventName) {
  try {
    // 查询总数
    let total = await schema.find().countDocuments();
    ep.emit(eventName, total);
  } catch (err) {
    ep.emit('error', err);
  }
}

async function limit(ep, schema, eventName, sort, count) {
  try {
    let total = await schema.find().sort(sort).limit(count);
    ep.emit(eventName, total);
  } catch (err) {
    ep.emit('error', err);
  }
}

async function init(ep, schema, eventName, data) {
  try {
    let count = await schema.find().countDocuments();
    if (count === 0) {
      await schema.insertMany(data);
      ep.emit(eventName, data);
    } else {
      ep.emit(eventName, null);
    }
  } catch (err) {
    ep.emit('error', err);
  }
}

module.exports = {
  findAllByPage,
  count,
  limit,
  init,
};

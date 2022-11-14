/*
 * @Autor: huasenjio
 * @Date: 2022-08-27 15:15:33
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-10 23:44:35
 * @Description: 用户访问统计表
 */
const mongoose = require('mongoose');

let RecordSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: [true, '唯一'],
    required: [true, '必需项'],
  },
  // 存入时间
  time: {
    type: String,
    required: [true, '必需项'],
  },
  // 访问数据
  log: {
    type: Object,
    required: [true, '必需项'],
  },
});

const Record = mongoose.model('records', RecordSchema);

module.exports = Record;

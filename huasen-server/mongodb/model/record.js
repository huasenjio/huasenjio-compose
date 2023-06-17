/*
 * @Autor: huasenjio
 * @Date: 2022-08-27 15:15:33
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-10 00:20:30
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
    validate: {
      validator: function (desc) {
        try {
          let t = new Date(desc);
          if (typeof t.getTime() == 'number') return true;
        } catch (err) {
          return false;
        }
      },
      message: '请输入YYYY-MM-DD时间格式',
    },
  },
  // 访问数据
  log: {
    type: Object,
    required: [true, '必需项'],
  },
});

const Record = mongoose.model('records', RecordSchema);

module.exports = Record;

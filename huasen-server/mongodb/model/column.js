/*
 * @Autor: huasenjio
 * @Date: 2023-03-06 22:15:13
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-11 22:52:03
 * @Description: 栏目表
 */
const mongoose = require('mongoose');

// 创建schema实例表对象
let ColumnSchema = new mongoose.Schema({
  // 栏目名称
  name: {
    type: String,
    minlength: [2, '名称长度不小于2'],
    maxlength: [10, '名称长度不大于10'],
    required: [true, '必需项'],
    trim: [true, '移除前后空格'],
  },
  // 栏目描述
  description: {
    type: String,
  },
  // 栏目封面
  banner: {
    type: String,
  },
  // 网站备注
  remarks: {
    type: String,
  },
  // 收纳的链接
  siteStore: {
    type: String,
    default: '[]',
    validate: {
      validator: function (desc) {
        try {
          let config = JSON.parse(desc);
          if (Object.prototype.toString.call(config) === '[object Array]') return true;
        } catch (err) {
          return false;
        }
      },
      message: '请输入JSON数组',
    },
  },
  // 拓展对象
  expand: {
    type: String,
    default: '{}',
    validate: {
      validator: function (desc) {
        try {
          let config = JSON.parse(desc);
          if (Object.prototype.toString.call(config) === '[object Object]') return true;
        } catch (err) {
          return false;
        }
      },
      message: '请输入JSON对象',
    },
  },
  // 栏目是否可用
  enabled: {
    type: Boolean,
    default: true,
  },
  // 权限码(0-3)
  code: {
    type: Number,
    default: 0,
    validate: {
      validator: function (code) {
        try {
          if (!Number.isInteger(code)) false;
          if (0 <= code && code <= 3) return true;
        } catch (error) {
          return false;
        }
      },
      message: '请输入0-3范围的权限码',
    },
  },
});

const Column = mongoose.model('column', ColumnSchema);
module.exports = Column;

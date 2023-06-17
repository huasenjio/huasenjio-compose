/*
 * @Autor: huasenjio
 * @Date: 2022-10-10 22:52:20
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-11 22:45:47
 * @Description: 发布者表
 */

const mongoose = require('mongoose');

// 创建schema实例表对象
let JournalSchema = new mongoose.Schema({
  // 昵称
  name: {
    type: String,
    minlength: [2, '名称长度不小于2'],
    maxlength: [20, '名称长度不大于20'],
  },

  // 栏目仓库
  columnStore: {
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

  // 账号是否可用
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

const Journal = mongoose.model('journal', JournalSchema);
module.exports = Journal;

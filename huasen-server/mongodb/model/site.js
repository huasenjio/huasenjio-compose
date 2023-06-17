/*
 * @Autor: huasenjio
 * @Date: 2023-03-06 22:15:13
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-19 23:21:36
 * @Description: 网链表
 */
const mongoose = require('mongoose');

// 创建schema实例表对象
let SiteSchema = new mongoose.Schema({
  // 站点名称
  name: {
    type: String,
    minlength: [2, '名称长度不小于2'],
    maxlength: [50, '名称长度不大于50'],
    required: [true, '必需项'],
  },
  // 网站链接
  url: {
    type: String,
    required: true,
  },
  // 网站描述
  description: {
    type: String,
  },
  // 网站图标
  icon: {
    type: String,
  },
  // 网站备注
  remarks: {
    type: String,
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
  // 链接是否可用
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

const Site = mongoose.model('site', SiteSchema);
module.exports = Site;

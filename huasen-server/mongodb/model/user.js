/*
 * @Autor: huasenjio
 * @Date: 2021-08-21 21:07:58
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-22 00:30:24
 * @Description: 用户表
 */
const mongoose = require('mongoose');
// 创建schema实例表对象
let UserSchema = new mongoose.Schema({
  // 登录邮箱
  id: {
    type: String,
    required: [true, '必需项'],
    minlength: [5, '账号长度不小于5'],
    maxlength: [20, '账号长度不大于50'],
    trim: [true, '剔除前后空格'],
    unique: [true, '唯一'],
  },

  // 登录密码
  password: {
    type: String,
    required: true,
    minlength: [5, '密码长度不小于5'],
    maxlength: [50, '密码长度不大于50'],
    trim: [true, '剔除前后空格'],
  },

  // 昵称
  name: {
    type: String,
    default: '花酱',
  },

  // 头像
  headImg: {
    type: String,
    default: '',
  },

  // 权限码(0-3)
  code: {
    type: Number,
    default: 0,
    validate: {
      validator: function (desc) {
        try {
          if (!Number.isInteger(desc)) false;
          if (desc > 3 || desc < -1) return false;
          return true;
        } catch (error) {
          return false;
        }
      },
      message: '请输入0-3范围的权限码',
    },
  },

  // 账号是否可用
  enabled: {
    type: Boolean,
    default: true,
  },

  // 注册时间
  time: {
    type: String,
    default: '1970-01-01',
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

  // 收藏的网站
  records: {
    type: String,
    default: '[]',
    validate: {
      validator: function (desc) {
        try {
          let temp = JSON.parse(desc);
          if (Object.prototype.toString.call(temp) === '[object Array]') {
            return temp.every(item => {
              return Object.prototype.toString.call(item) === '[object Object]' && item.hasOwnProperty('id') && item.hasOwnProperty('name') && item.hasOwnProperty('url') && item.hasOwnProperty('remark');
            });
          }
        } catch (err) {
          return false;
        }
      },
      message: '请输入正确[]格式的JSON',
    },
  },

  // 配置
  config: {
    type: String,
    default: '{}',
    validate: {
      validator: function (desc) {
        try {
          let temp = JSON.parse(desc);
          if (Object.prototype.toString.call(temp) === '[object Object]') {
            return true;
          }
        } catch (err) {
          return false;
        }
      },
      message: '请输入正确{}格式的JSON',
    },
  },
});

const User = mongoose.model('users', UserSchema);
module.exports = User;

/*
 * @Autor: huasenjio
 * @Date: 2022-10-01 10:38:45
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-21 23:15:12
 * @Description: 管理人员表
 */

const mongoose = require('mongoose');

let ManageSchema = new mongoose.Schema({
  // 邮箱
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
  // 权限码(0-3)
  code: {
    type: Number,
    default: 3,
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
});

const Manage = mongoose.model('manages', ManageSchema);
module.exports = Manage;

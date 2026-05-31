const mongoose = require('mongoose');

let AIAppSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '必需项'],
      minlength: [2, '名称长度不小于2'],
      maxlength: [50, '名称长度不大于50'],
    },
    description: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    providerId: {
      type: String,
      // required: [true, '必需项'],
    },
    presetId: {
      type: String,
      default: '',
    },
    welcomeText: {
      type: String,
      default: '',
    },
    // 权限码(0-3)，用户 code 大于等于应用 code 才可见、可用
    code: {
      type: Number,
      default: 0,
      validate: {
        validator: function (code) {
          try {
            if (!Number.isInteger(code)) return false;
            if (0 <= code && code <= 3) return true;
          } catch (error) {
            return false;
          }
          return false;
        },
        message: '请输入0-3范围的权限码',
      },
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    sort: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: 'creatTime',
      updatedAt: 'updateTime',
    },
  },
);

const AIApp = mongoose.model('aiApp', AIAppSchema);
module.exports = AIApp;

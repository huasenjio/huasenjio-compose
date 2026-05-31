const mongoose = require('mongoose');

let AIKnowledgePackSchema = new mongoose.Schema(
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
    appIds: {
      type: [String],
      default: [],
    },
    articleIds: {
      type: [String],
      default: [],
    },
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
    maxArticles: {
      type: Number,
      default: 5,
    },
    maxKnowledgeChars: {
      type: Number,
      default: 100000,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: 'creatTime',
      updatedAt: 'updateTime',
    },
  },
);

const AIKnowledgePack = mongoose.model('aiKnowledgePack', AIKnowledgePackSchema);
module.exports = AIKnowledgePack;

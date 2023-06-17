/*
 * @Autor: huasenjio
 * @Date: 2022-10-04 20:46:00
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-07 00:31:53
 * @Description: 文章表
 */

const mongoose = require('mongoose');

let ArticleSchema = new mongoose.Schema({
  // 发布者id
  manageId: {
    type: String,
    required: [true, '必需项'],
  },

  // 标题
  title: {
    type: String,
    required: [true, '必需项'],
    minlength: [2, '昵称长度不小于2'],
    maxlength: [20, '昵称长度不大于20'],
  },

  // 权限码(0-3)
  code: {
    type: Number,
    required: [true, '必需项'],
    validate: {
      validator: function (desc) {
        try {
          if (!Number.isInteger(desc)) false;
          if (desc > 3 || desc < -1) return false;
          return true;
        } catch (err) {
          return false;
        }
      },
      message: '请输入0-3范围的权限码',
    },
  },

  // 标签
  tag: {
    type: String,
    validate: {
      validator: function (desc) {
        if (!desc) return true;
        try {
          let temp = desc.split(/[\/|\\]/);
          return temp.every(item => {
            return item !== '';
          });
        } catch (err) {
          return false;
        }
      },
      message: '请输入a/b/c格式的字符',
    },
  },

  // 最后修改时间
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

  // 内容
  content: {
    type: String,
    default: '',
  },

  // 封面
  bannerImg: {
    type: String,
    default: '',
  },

  // 是否草稿
  isDraft: {
    type: Boolean,
    default: false,
  },
});

const Article = mongoose.model('articles', ArticleSchema);

module.exports = Article;

const mongoose = require('mongoose');

// 创建schema实例表对象
let Journal2ColumnSchema = new mongoose.Schema(
  {
    journalId: {
      type: String,
      required: [true, '必需项'],
    },
    columnId: {
      type: String,
      required: [true, '必需项'],
    },
    order: {
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

const Journal = mongoose.model('journal2column', Journal2ColumnSchema);
module.exports = Journal;

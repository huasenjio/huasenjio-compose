const mongoose = require('mongoose');

// 创建schema实例表对象
let Column2SiteSchema = new mongoose.Schema(
  {
    columnId: {
      type: String,
      required: [true, '必需项'],
    },

    siteId: {
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

Column2SiteSchema.index({ columnId: 1, siteId: 1 }, { unique: true });
const Column2Site = mongoose.model('column2site', Column2SiteSchema);
module.exports = Column2Site;

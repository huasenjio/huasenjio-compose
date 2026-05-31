const mongoose = require('mongoose');

let Site2TagSchema = new mongoose.Schema(
  {
    siteId: {
      type: String,
      required: [true, '必需项'],
    },

    tagId: {
      type: String,
      required: [true, '必需项'],
    },
  },
  {
    timestamps: {
      createdAt: 'creatTime',
      updatedAt: 'updateTime',
    },
  },
);

const Site2Tag = mongoose.model('site2tag', Site2TagSchema);
module.exports = Site2Tag;

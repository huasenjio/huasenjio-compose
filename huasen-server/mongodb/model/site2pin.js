const mongoose = require('mongoose');

let Site2PinSchema = new mongoose.Schema(
  {
    siteId: {
      type: String,
      required: [true, '必需项'],
    },

    pinId: {
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
const Site2Pin = mongoose.model('site2pin', Site2PinSchema);
module.exports = Site2Pin;

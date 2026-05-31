const mongoose = require('mongoose');

let PinSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '必需项'],
    },
    color: {
      type: String,
    },
    bgColor: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: 'creatTime',
      updatedAt: 'updateTime',
    },
  },
);

const Pin = mongoose.model('pin', PinSchema);
module.exports = Pin;

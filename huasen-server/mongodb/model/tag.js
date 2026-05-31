const mongoose = require('mongoose');

let TagSchema = new mongoose.Schema(
  {
    name: {
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

const Tag = mongoose.model('tag', TagSchema);
module.exports = Tag;

const mongoose = require('mongoose');

let AIAttachmentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, '必需项'],
    },
    conversationId: {
      type: String,
      default: '',
    },
    messageId: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      required: [true, '必需项'],
    },
    path: {
      type: String,
      required: [true, '必需项'],
    },
    url: {
      type: String,
      required: [true, '必需项'],
    },
    mimeType: {
      type: String,
      default: '',
    },
    size: {
      type: Number,
      default: 0,
    },
    ext: {
      type: String,
      default: '',
    },
    kind: {
      type: String,
      default: 'file',
      enum: ['image', 'file'],
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

const AIAttachment = mongoose.model('aiAttachment', AIAttachmentSchema);
module.exports = AIAttachment;

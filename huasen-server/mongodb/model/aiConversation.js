const mongoose = require('mongoose');

let AIConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, '必需项'],
    },
    appId: {
      type: String,
      required: [true, '必需项'],
    },
    presetId: {
      type: String,
      default: '',
    },
    knowledgePackIds: {
      type: [String],
      default: [],
    },
    title: {
      type: String,
      default: '新会话',
    },
    summary: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      default: 'portal',
      enum: ['portal', 'plugin'],
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    messageCount: {
      type: Number,
      default: 0,
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

const AIConversation = mongoose.model('aiConversation', AIConversationSchema);
module.exports = AIConversation;

const mongoose = require('mongoose');

let AIMessageSchema = new mongoose.Schema(
  {
    conversationId: {
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
    providerId: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      required: [true, '必需项'],
      enum: ['system', 'user', 'assistant'],
    },
    content: {
      type: String,
      default: '',
    },
    contentType: {
      type: String,
      default: 'text',
      enum: ['text', 'json-object', 'json-schema'],
    },
    attachmentIds: {
      type: [String],
      default: [],
    },
    model: {
      type: String,
      default: '',
    },
    usage: {
      type: String,
      default: '{}',
    },
    finishReason: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: 'success',
      enum: ['success', 'failed', 'pending', 'stopped'],
    },
    errorMessage: {
      type: String,
      default: '',
    },
    rawResponse: {
      type: String,
      default: '{}',
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

const AIMessage = mongoose.model('aiMessage', AIMessageSchema);
module.exports = AIMessage;

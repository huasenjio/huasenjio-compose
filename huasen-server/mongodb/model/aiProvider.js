const mongoose = require('mongoose');

let AIProviderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '必需项'],
      minlength: [2, '名称长度不小于2'],
      maxlength: [50, '名称长度不大于50'],
    },
    providerType: {
      type: String,
      required: [true, '必需项'],
      enum: ['qwen', 'deepseek', 'kimi', 'siliconflow', 'camel', 'custom'],
    },
    baseUrl: {
      type: String,
      default: '',
    },
    apiKey: {
      type: String,
      required: [true, '必需项'],
    },
    remarks: {
      type: String,
      default: '',
    },
    extraConfig: {
      type: String,
      default: '{}',
    },
    supportsImageInput: {
      type: Boolean,
      default: false,
    },
    supportsDocumentInline: {
      type: Boolean,
      default: false,
    },
    supportsTextFallback: {
      type: Boolean,
      default: true,
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

const AIProvider = mongoose.model('aiProvider', AIProviderSchema);
module.exports = AIProvider;

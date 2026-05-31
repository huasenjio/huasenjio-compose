const mongoose = require('mongoose');

let AIPresetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '必需项'],
      minlength: [2, '名称长度不小于2'],
      maxlength: [50, '名称长度不大于50'],
    },
    appId: {
      type: String,
      // required: [true, '必需项'],
    },
    providerId: {
      type: String,
      // required: [true, '必需项'],
    },
    model: {
      type: String,
      required: [true, '必需项'],
    },
    promptTemplate: {
      type: String,
      default: '',
    },
    params: {
      type: String,
      default: '{}',
    },
    temperature: {
      type: Number,
      default: 0.7,
    },
    maxTokens: {
      type: Number,
      default: 2048,
    },
    topP: {
      type: Number,
      default: 1,
    },
    allowImage: {
      type: Boolean,
      default: false,
    },
    acceptImageTypes: {
      type: [String],
      default: [],
    },
    allowFile: {
      type: Boolean,
      default: false,
    },
    acceptFileTypes: {
      type: [String],
      default: [],
    },
    imageAsBase64: {
      type: Boolean,
      default: false,
    },
    maxContextMessages: {
      type: Number,
      default: 128,
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

const AIPreset = mongoose.model('aiPreset', AIPresetSchema);
module.exports = AIPreset;

/*
 * @Autor: huasenjio
 * @Date: 2026-04-28 00:00:00
 * @LastEditors: huasenjio
 * @LastEditTime: 2026-04-28 00:00:00
 * @Description: AI 插件 SFC 源码版本管理表
 */
const mongoose = require('mongoose');

const AiPluginSourceSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'creatTime', updatedAt: 'updateTime' },
  },
);

const AiPluginSource = mongoose.model('aiPluginSource', AiPluginSourceSchema);
module.exports = AiPluginSource;

/*
 * @Autor: huasenjio
 * @Date: 2026-04-28 00:00:00
 * @LastEditors: huasenjio
 * @LastEditTime: 2026-04-28 00:00:00
 * @Description: AI 插件能力配置表
 */
const mongoose = require('mongoose');

const AIAbilitySchema = new mongoose.Schema(
  {
    abilityCode: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: '',
    },
    appId: {
      type: String,
      default: '',
    },
    defaultResponseFormat: {
      type: String,
      enum: ['text', 'json_object'],
      default: 'json_object',
    },
    defaultPrompt: {
      type: String,
      default: '',
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    code: {
      type: Number,
      default: 0,
      validate: {
        validator: function (code) {
          try {
            if (!Number.isInteger(code)) return false;
            if (0 <= code && code <= 3) return true;
          } catch (error) {
            return false;
          }
        },
        message: '请输入0-3范围的权限码',
      },
    },
  },
  {
    timestamps: { createdAt: 'creatTime', updatedAt: 'updateTime' },
  },
);

const AIAbility = mongoose.model('aiAbility', AIAbilitySchema);
module.exports = AIAbility;

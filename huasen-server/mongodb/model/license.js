/*
 * @Autor: huasenjio
 * @Date: 2026-04-28 00:00:00
 * @LastEditors: huasenjio
 * @LastEditTime: 2026-04-28 00:00:00
 * @Description: 授权记录表
 */
const mongoose = require('mongoose');

const LicenseSchema = new mongoose.Schema(
  {
    licenseKey: {
      type: String,
      required: true,
      unique: true,
    },
    domain: {
      type: String,
      default: '',
    },
    userId: {
      type: String,
      required: true,
      default: '',
    },
    fingerprints: {
      type: [String],
      default: [],
    },
    type: {
      type: String,
      enum: ['monthly', 'yearly', 'permanent'],
      required: true,
    },
    activatedAt: {
      type: Date,
      default: Date.now,
    },
    expireAt: {
      type: Date,
      default: null,
    },
    remark: {
      type: String,
      default: '',
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    licenseToken: {
      type: String,
      default: '',
    },
    leaseExpireAt: {
      type: Date,
      default: null,
    },
    lastVerifiedAt: {
      type: Date,
      default: null,
    },
    lastSyncAt: {
      type: Date,
      default: null,
    },
    lastRiskReportAt: {
      type: Date,
      default: null,
    },
    riskScore: {
      type: Number,
      default: 0,
    },
    riskLevel: {
      type: String,
      enum: ['normal', 'suspicious', 'blocked'],
      default: 'normal',
    },
  },
  {
    timestamps: { createdAt: 'creatTime', updatedAt: 'updateTime' },
  },
);

const License = mongoose.model('license', LicenseSchema);
module.exports = License;

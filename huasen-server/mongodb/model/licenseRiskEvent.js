/*
 * @Autor: huasenjio
 * @Date: 2026-05-09 00:00:00
 * @LastEditors: huasenjio
 * @LastEditTime: 2026-05-09 00:00:00
 * @Description: 授权风控事件
 */
const mongoose = require('mongoose');

const LicenseRiskEventSchema = new mongoose.Schema(
  {
    licenseKeyHash: {
      type: String,
      default: '',
      index: true,
    },
    licenseKey: {
      type: String,
      default: '',
      index: true,
    },
    userId: {
      type: String,
      default: '',
      index: true,
    },
    tokenId: {
      type: String,
      default: '',
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    eventMessage: {
      type: String,
      default: '',
    },
    domain: {
      type: String,
      default: '',
    },
    licenseDomain: {
      type: String,
      default: '',
    },
    fingerprint: {
      type: String,
      default: '',
    },
    authorizedFingerprints: {
      type: [String],
      default: [],
    },
    sourceVersion: {
      type: String,
      default: '',
    },
    tamperedField: {
      type: String,
      default: '',
    },
    localTime: {
      type: Date,
      default: null,
    },
    ip: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    sdkVersion: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: 'creatTime', updatedAt: 'updateTime' },
  },
);

const LicenseRiskEvent = mongoose.model('licenseRiskEvent', LicenseRiskEventSchema);
module.exports = LicenseRiskEvent;

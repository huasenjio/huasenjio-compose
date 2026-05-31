/*
 * @Autor: huasenjio
 * @Date: 2026-04-28 00:00:00
 * @LastEditors: huasenjio
 * @LastEditTime: 2026-04-28 00:00:00
 * @Description: 授权路由
 */
const express = require('express');
const router = express.Router();
const { handleJWT } = require('../middleware/common.middleware.js');
const { checkManagePower } = require('../middleware/power.middleware.js');
const { activate, status, advancedStatus, sync, riskReport, verify, officialSync, manageAdd, manageUpdate, manageRemove, manageRenew, manageFindByPage } = require('../controller/license.controller.js');

// 开源路由（始终可用）
router.post('/activate', handleJWT(), activate);
router.post('/status', handleJWT(), status);
router.post('/advanced/status', handleJWT(false), advancedStatus);
router.post('/risk/report', riskReport);
router.post('/sync', handleJWT(), checkManagePower, sync);

// 闭源路由
if (verify) router.post('/verify', verify);
if (officialSync) router.post('/center/sync', officialSync);
if (manageAdd) router.post('/manage/add', handleJWT(), checkManagePower, manageAdd);
if (manageUpdate) router.post('/manage/update', handleJWT(), checkManagePower, manageUpdate);
if (manageRemove) router.post('/manage/remove', handleJWT(), checkManagePower, manageRemove);
if (manageRenew) router.post('/manage/renew', handleJWT(), checkManagePower, manageRenew);
if (manageFindByPage) router.post('/manage/findByPage', handleJWT(), checkManagePower, manageFindByPage);

module.exports = router;

/*
 * @Autor: huasenjio
 * @Date: 2021-08-21 21:07:58
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-05-24 22:54:28
 * @Description: 用户路由
 */

const express = require('express');
const router = express.Router();
const { findAll, findAllIcon, remove, uploadFileToStore } = require('../controller/file.controller.js');
const { checkManagePower } = require('../middleware/power.middleware.js');
const { handleJWT } = require('../middleware/common.middleware.js');

router.get('/findAll', handleJWT(), checkManagePower, findAll);
router.get('/findAllIcon', handleJWT(), checkManagePower, findAllIcon);
router.post('/remove', handleJWT(), checkManagePower, remove);
router.post('/upload', handleJWT(), checkManagePower, uploadFileToStore);
router.post('/uploadIcon', handleJWT(), checkManagePower, uploadFileToStore);

module.exports = router;

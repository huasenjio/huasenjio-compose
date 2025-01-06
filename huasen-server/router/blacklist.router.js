/*
 * @Autor: huasenjio
 * @Date: 2021-08-21 21:07:58
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-23 00:16:23
 * @Description: 用户路由
 */

const express = require('express');
const router = express.Router();
const { findByPage, remove, add } = require('../controller/blacklist.controller.js');
const { checkManagePower } = require('../middleware/power.middleware.js');
const { handleJWT } = require('../middleware/common.middleware.js');

router.post('/add', handleJWT(), checkManagePower, add);
router.post('/remove', handleJWT(), checkManagePower, remove);
router.post('/findByPage', handleJWT(), checkManagePower, findByPage);

module.exports = router;

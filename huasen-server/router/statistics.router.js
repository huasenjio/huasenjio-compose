/*
 * @Autor: huasenjio
 * @Date: 2022-10-02 00:24:33
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-25 16:54:01
 * @Description: 数据统计路由
 */
const express = require('express');
const router = express.Router();

const { overview, visitorInfo, diskInfo, uvInfo } = require('../controller/statistics.controller.js');

const { checkManagePower } = require('../middleware/power.middleware.js');
const { handleJWT } = require('../middleware/common.middleware.js');

router.post('/overview', handleJWT(), checkManagePower, overview);
router.post('/disk', handleJWT(), checkManagePower, diskInfo);
router.post('/uv', handleJWT(), checkManagePower, uvInfo);
router.post('/visitor', handleJWT(), checkManagePower, visitorInfo);

module.exports = router;

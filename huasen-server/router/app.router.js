/*
 * @Autor: huasenjio
 * @Date: 2022-10-22 15:30:53
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-22 15:31:03
 * @Description: 邮箱路由
 */

const express = require('express');
const router = express.Router();

const { getCopyright } = require('../controller/app.controller.js');

/**
 * @api {get} /app/getCopyright 获取版权信息
 * @apiVersion 1.0.0
 * @apiGroup App
 */
router.get('/getCopyright', getCopyright);

module.exports = router;

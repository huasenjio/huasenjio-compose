/*
 * @Autor: huasenjio
 * @Date: 2022-10-22 15:30:53
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-22 15:31:03
 * @Description: 邮箱路由
 */

const express = require('express');
const router = express.Router();

const { getCode } = require('../controller/mail.controller.js');

/**
 * @api {get} /mail/getCode 获取验证码
 * @apiVersion 1.0.0
 * @apiGroup Mail
 * @apiParam {string} mail 邮箱地址
 */
router.get('/getCode', getCode);

module.exports = router;

/*
 * @Autor: huasenjio
 * @Date: 2021-08-21 21:07:58
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-23 00:16:48
 * @Description: 用户路由
 */

const express = require('express');
const router = express.Router();
const { findAll, remove } = require('../controller/file.controller.js');
const { checkManagePower } = require('../middleware/manage.middleware.js');
const { handleJWT } = require('../middleware/common.middleware.js');

router.get('/findAll', handleJWT, checkManagePower, findAll);
router.post('/remove', handleJWT, checkManagePower, remove);

module.exports = router;

/*
 * @Autor: huasenjio
 * @Date: 2022-10-29 12:17:56
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-29 12:19:41
 * @Description: 记录路由
 */
const express = require('express');
const router = express.Router();
const { add, findAllByPage, remove } = require('../controller/record.controller.js');
const { handleJWT, handleUselessParams } = require('../middleware/common.middleware.js');
const { checkManagePower } = require('../middleware/manage.middleware.js');

router.post('/add', handleJWT, checkManagePower, handleUselessParams, add);
router.post('/findByPage', handleJWT, checkManagePower, findAllByPage);
router.post('/remove', handleJWT, checkManagePower, remove);

module.exports = router;

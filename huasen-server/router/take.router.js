/*
 * @Autor: huasenjio
 * @Date: 2021-08-21 21:07:58
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-24 00:17:40
 * @Description: 订阅路由
 */

const express = require('express');
const router = express.Router();
const { add, findAllByPage, remove, update, findByCode } = require('../controller/take.controller.js');
const { handleJWT, handleUselessParams } = require('../middleware/common.middleware.js');
const { checkManagePower } = require('../middleware/manage.middleware.js');

router.post('/add', handleJWT, checkManagePower, handleUselessParams, add);
router.post('/findByPage', handleJWT, checkManagePower, findAllByPage);
router.post('/remove', handleJWT, checkManagePower, remove);
router.post('/update', handleJWT, checkManagePower, update);

// 用户调用
router.post('/findByCode', handleJWT, findByCode);

module.exports = router;

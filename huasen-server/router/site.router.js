/*
 * @Autor: huasenjio
 * @Date: 2021-08-21 21:07:58
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-04-23 22:33:35
 * @Description: 网链路由
 */

const express = require('express');
const router = express.Router();
const { add, addMany, findAllByPage, remove, removeMany, update, findByCode, findByList } = require('../controller/site.controller.js');
const { handleJWT, handleUselessParams } = require('../middleware/common.middleware.js');
const { checkManagePower } = require('../middleware/manage.middleware.js');

router.post('/add', handleJWT, checkManagePower, handleUselessParams, add);
router.post('/addMany', handleJWT, checkManagePower, handleUselessParams, addMany);
router.post('/findByPage', handleJWT, checkManagePower, findAllByPage);
router.post('/remove', handleJWT, checkManagePower, remove);
router.post('/removeMany', handleJWT, checkManagePower, removeMany);
router.post('/update', handleJWT, checkManagePower, update);
router.post('/list', handleJWT, checkManagePower, findByList);
router.post('/findByCode', handleJWT, findByCode);

module.exports = router;

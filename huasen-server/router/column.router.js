/*
 * @Autor: huasenjio
 * @Date: 2021-08-21 21:07:58
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-12 10:52:14
 * @Description: 栏目路由
 */

const express = require('express');
const router = express.Router();

const { add, findByPage, remove, update, findByCode, findByList, bindSite, unbindSite } = require('../controller/column.controller.js');
const { handleJWT, handleUselessParams } = require('../middleware/common.middleware.js');
const { checkManagePower } = require('../middleware/manage.middleware.js');

router.post('/add', handleJWT(), checkManagePower, handleUselessParams, add);
router.post('/remove', handleJWT(), checkManagePower, remove);
router.post('/update', handleJWT(), checkManagePower, update);
router.post('/list', handleJWT(), checkManagePower, findByList);
router.post('/findByCode', handleJWT(), checkManagePower, findByCode);
router.post('/findByPage', handleJWT(), checkManagePower, findByPage);
router.post('/bindSite', handleJWT(), checkManagePower, bindSite);
router.post('/unbindSite', handleJWT(), checkManagePower, unbindSite);

module.exports = router;

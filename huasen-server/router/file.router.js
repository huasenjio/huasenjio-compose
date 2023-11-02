/*
 * @Autor: huasenjio
 * @Date: 2021-08-21 21:07:58
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-05-24 22:54:28
 * @Description: 用户路由
 */

const express = require('express');
const router = express.Router();
const { findAll, findAllIcon, remove, downloadStoreByZip } = require('../controller/file.controller.js');
const { checkManagePower } = require('../middleware/manage.middleware.js');
const { handleJWT } = require('../middleware/common.middleware.js');

router.get('/findAll', handleJWT, checkManagePower, findAll);
router.get('/findAllIcon', handleJWT, checkManagePower, findAllIcon);
router.post('/remove', handleJWT, checkManagePower, remove);
router.post('/downloadStoreByZip', handleJWT, checkManagePower, downloadStoreByZip);

module.exports = router;

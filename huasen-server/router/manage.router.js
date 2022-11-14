/*
 * @Autor: huasenjio
 * @Date: 2022-10-02 00:24:33
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-11-05 15:13:55
 * @Description: 管理员路由
 */
const express = require('express');
const router = express.Router();

const { login, add, findAllByPage, update, remove, overview, visitor, diskOverview, uvOverview, config } = require('../controller/manage.controller.js');

const { upload, checkManagePower, checkManageAccountUnique } = require('../middleware/manage.middleware.js');
const { handleUselessParams } = require('../middleware/common.middleware.js');
const { handleJWT } = require('../middleware/common.middleware.js');

router.post('/login', login);
router.post('/upload', handleJWT, checkManagePower, upload);
router.post('/uploadIcon', handleJWT, checkManagePower, upload);
router.post('/add', handleJWT, checkManagePower, checkManageAccountUnique, handleUselessParams, add);
router.post('/findByPage', handleJWT, checkManagePower, findAllByPage);
router.post('/remove', handleJWT, checkManagePower, remove);
router.post('/update', handleJWT, checkManagePower, update);

router.post('/overview', handleJWT, checkManagePower, overview);
router.post('/diskOverview', handleJWT, checkManagePower, diskOverview);
router.post('/uvOverview', handleJWT, checkManagePower, uvOverview);
router.post('/visitor', handleJWT, checkManagePower, visitor);

router.post('/appConfig', config);
router.post('/webConfig', handleJWT, checkManagePower, config);

module.exports = router;

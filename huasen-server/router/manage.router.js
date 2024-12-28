/*
 * @Autor: huasenjio
 * @Date: 2022-10-02 00:24:33
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-25 16:54:01
 * @Description: 管理员路由
 */
const express = require('express');
const router = express.Router();

const { login, exist, init, add, findByPage, update, remove, quit, offline, overview, visitor, diskOverview, uvOverview, executeRuntimeCode, findAppConfig, saveAppConfig, findAppFavicon, uploadFileToStore } = require('../controller/manage.controller.js');

const { checkManagePower, checkManageAccountUnique, checkManageHighestPower } = require('../middleware/manage.middleware.js');
const { handleUselessParams } = require('../middleware/common.middleware.js');
const { handleJWT } = require('../middleware/common.middleware.js');

/**
 * @api {post} /manage/login 登录管理员
 * @apiVersion 1.0.0
 * @apiGroup Manage
 * @apiParam {string} id 管理员账号
 * @apiParam {string} password 管理员密码
 */
router.post('/login', login);

/**
 * @api {post} /manage/init 初始化管理员账号
 * @apiVersion 1.0.0
 * @apiGroup Manage
 * @apiParam {string} id 管理员账号
 * @apiParam {string} password 管理员密码
 */
router.post('/init', init);

/**
 * @api {post} /manage/exist 管理员账号是否存在
 * @apiVersion 1.0.0
 * @apiGroup Manage
 */
router.post('/exist', exist);

router.post('/add', handleJWT(), checkManagePower, checkManageHighestPower, checkManageAccountUnique, handleUselessParams, add);
router.post('/remove', handleJWT(), checkManagePower, checkManageHighestPower, remove);
router.post('/update', handleJWT(), checkManagePower, update);
router.post('/findByPage', handleJWT(), checkManagePower, findByPage);
router.post('/upload', handleJWT(), checkManagePower, uploadFileToStore);
router.post('/uploadIcon', handleJWT(), checkManagePower, uploadFileToStore);

/**
 * @api {post} /manage/quit 退出登录
 * @apiVersion 1.0.0
 * @apiGroup Manage
 */
router.post('/quit', handleJWT(), checkManagePower, quit);

/**
 * @api {post} /manage/offline 下线
 * @apiVersion 1.0.0
 * @apiGroup Manage
 * @apiParam {string} id 账号
 */
router.post('/offline', handleJWT(), checkManagePower, offline);

router.post('/overview', handleJWT(), checkManagePower, overview);
router.post('/diskOverview', handleJWT(), checkManagePower, diskOverview);
router.post('/uvOverview', handleJWT(), checkManagePower, uvOverview);
router.post('/visitor', handleJWT(), checkManagePower, visitor);
router.post('/executeRuntimeCode', handleJWT(), checkManagePower, checkManageHighestPower, executeRuntimeCode);
router.post('/saveAppConfig', handleJWT(), checkManagePower, checkManageHighestPower, saveAppConfig);
router.post('/findAppFavicon', handleJWT(), checkManagePower, findAppFavicon);
router.post('/findAppConfig', handleJWT(), checkManagePower, findAppConfig);

module.exports = router;

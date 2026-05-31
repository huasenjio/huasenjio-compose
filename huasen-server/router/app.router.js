/*
 * @Autor: huasenjio
 * @Date: 2022-10-22 15:30:53
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-22 15:31:03
 * @Description: 邮箱路由
 */

const express = require('express');
const router = express.Router();

const { checkManagePower, checkManageHighestPower } = require('../middleware/power.middleware.js');
const { handleJWT } = require('../middleware/common.middleware.js');
const { getCopyright, getDictionary, findAppConfig, saveAppConfig, runCode, offline, getCity } = require('../controller/app.controller.js');

/**
 * @api {get} /app/getCopyright 获取版权信息
 * @apiVersion 1.0.0
 * @apiGroup App
 */
router.get('/getCopyright', getCopyright);

/**
 * @api {post} /app/getDictionary 获取字典
 * @apiVersion 1.0.0
 * @apiGroup App
 */
router.post('/getDictionary', getDictionary);

/**
 * @api {post} /app/user/findAppConfig 用户查询配置
 * @apiVersion 1.0.0
 * @apiGroup App
 */
router.post('/user/findAppConfig', handleJWT(false), findAppConfig);

/**
 * @api {post} /app/manage/findAppConfig 管理员查询配置
 * @apiVersion 1.0.0
 * @apiGroup App
 */
router.post('/manage/findAppConfig', handleJWT(), checkManagePower, findAppConfig);

/**
 * @api {post} /app/saveAppConfig 保存配置
 * @apiVersion 1.0.0
 * @apiGroup App
 * @apiParam {string} systemConfig 系统配置
 */
router.post('/saveAppConfig', handleJWT(), checkManagePower, checkManageHighestPower, saveAppConfig);

/**
 * @api {post} /app/runCode 运行代码
 * @apiVersion 1.0.0
 * @apiGroup App
 * @apiParam {string} runtimeScript 运行代码
 */
router.post('/runCode', handleJWT(), checkManagePower, checkManageHighestPower, runCode);

/**
 * @api {post} /app/offline 下线
 * @apiVersion 1.0.0
 * @apiGroup App
 * @apiParam {string} id 账号
 */
router.post('/offline', handleJWT(), checkManagePower, checkManageHighestPower, offline);

/**
 * @api {get} /app/getCity 获取城市
 * @apiVersion 1.0.0
 * @apiGroup App
 */
router.get('/getCity', getCity);

module.exports = router;

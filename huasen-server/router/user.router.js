/*
 * @Autor: huasenjio
 * @Date: 2021-08-21 21:07:58
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-19 12:08:00
 * @Description: 用户路由
 */
const express = require('express');
const router = express.Router();
const { login, register, updatePassword, recovery, backup, add, findAllByPage, remove, update, findAppConfig } = require('../controller/user.controller.js');
const { handleJWT, handleUselessParams } = require('../middleware/common.middleware.js');
const { checkManagePower, checkManageHighestPower } = require('../middleware/manage.middleware.js');
const { checkUserAccountUnique } = require('../middleware/user.middleware.js');
const { checkMailCode } = require('../middleware/mail.middleware.js');

/**
 * @api {post} /user/login 登录
 * @apiVersion 1.0.0
 * @apiGroup User
 * @apiParam {string} id 邮箱地址
 * @apiParam {string} password 密码
 */
router.post('/login', login);
router.post('/register', checkMailCode, checkUserAccountUnique, handleUselessParams, register);
router.post('/updatePassword', checkMailCode, handleUselessParams, updatePassword);

/**
 * @api {post} /user/backup 备份数据
 * @apiVersion 1.0.0
 * @apiGroup User
 * @apiParam {string=json数组} records="[]" 收录列表
 * @apiParam {string=json对象} config="{}" 用户配置
 */
router.post('/backup', handleJWT, handleUselessParams, backup);

/**
 * @api {post} /user/recovery
 * @apiVersion 1.0.0
 * @apiGroup User
 * @apiSuccessExample {json} 请求成功:
 * {
 *    "records": [],
 *    "config": {}
 * }
 */
router.post('/recovery', handleJWT, recovery);
router.post('/findAppConfig', handleJWT, findAppConfig);

router.post('/add', handleJWT, checkManagePower, checkUserAccountUnique, handleUselessParams, add);
router.post('/findByPage', handleJWT, checkManagePower, findAllByPage);
router.post('/remove', handleJWT, checkManagePower, checkManageHighestPower, remove);
router.post('/update', handleJWT, checkManagePower, checkManageHighestPower, update);

module.exports = router;

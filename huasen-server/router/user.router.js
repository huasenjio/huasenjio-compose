/*
 * @Autor: huasenjio
 * @Date: 2021-08-21 21:07:58
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-19 12:08:00
 * @Description: 用户路由
 */
const express = require('express');
const router = express.Router();
const { login, register, updatePassword, recovery, backup, quit, add, findByPage, remove, update, manageLogin, manageExist, manageInit } = require('../controller/user.controller.js');
const { handleJWT, handleUselessParams } = require('../middleware/common.middleware.js');
const { checkManagePower, checkManageHighestPower } = require('../middleware/power.middleware.js');
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
router.post('/backup', handleJWT(), handleUselessParams, backup);

/**
 * @api {post} /user/quit 退出登录
 * @apiVersion 1.0.0
 * @apiGroup User
 */
router.post('/quit', handleJWT(), quit);

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
router.post('/recovery', handleJWT(), recovery);


/**
 * @api {post} /user/manage/login 登录管理员
 * @apiVersion 1.0.0
 * @apiGroup Manage
 * @apiParam {string} id 管理员账号
 * @apiParam {string} password 管理员密码
 */
router.post('/manage/login', manageLogin);

/**
 * @api {post} /user/manage/init 初始化管理员账号
 * @apiVersion 1.0.0
 * @apiGroup Manage
 * @apiParam {string} id 管理员账号
 * @apiParam {string} password 管理员密码
 */
router.post('/manage/init', manageInit);

/**
 * @api {post} /user/manage/exist 判断已存在管理员
 * @apiVersion 1.0.0
 * @apiGroup Manage
 */
router.post('/manage/exist', manageExist);

router.post('/add', handleJWT(), checkManagePower, checkManageHighestPower, checkUserAccountUnique, handleUselessParams, add);
router.post('/remove', handleJWT(), checkManagePower, checkManageHighestPower, remove);
router.post('/update', handleJWT(), checkManagePower, checkManageHighestPower, update);
router.post('/findByPage', handleJWT(), checkManagePower, findByPage);

module.exports = router;

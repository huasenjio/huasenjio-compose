/*
 * @Autor: huasenjio
 * @Date: 2021-08-21 21:07:58
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-19 12:08:00
 * @Description: 用户路由
 */
const express = require('express');
const router = express.Router();
const { login, register, updatePassword, consistentFromCloud, backup, add, findAllByPage, remove, update } = require('../controller/user.controller.js');
const { handleJWT, handleUselessParams } = require('../middleware/common.middleware.js');
const { checkManagePower, checkManageHighestPower } = require('../middleware/manage.middleware.js');
const { checkUserAccountUnique } = require('../middleware/user.middleware.js');
const { checkMailCode } = require('../middleware/mail.middleware.js');

router.post('/login', login);
router.post('/register', checkMailCode, checkUserAccountUnique, handleUselessParams, register);
router.post('/updatePassword', checkMailCode, handleUselessParams, updatePassword);
router.post('/backup', handleJWT, handleUselessParams, backup);
router.post('/consistentFromCloud', handleJWT, consistentFromCloud);

router.post('/add', handleJWT, checkManagePower, checkUserAccountUnique, handleUselessParams, add);
router.post('/findByPage', handleJWT, checkManagePower, findAllByPage);
router.post('/remove', handleJWT, checkManagePower, checkManageHighestPower, remove);
router.post('/update', handleJWT, checkManagePower, checkManageHighestPower, update);

module.exports = router;

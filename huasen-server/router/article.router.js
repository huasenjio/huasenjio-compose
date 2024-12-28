/*
 * @Autor: huasenjio
 * @Date: 2021-08-21 21:07:58
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-26 01:12:47
 * @Description:
 */
const express = require('express');
const router = express.Router();

const { add, findByPage, findAllByList, remove, findById, update, findByCode } = require('../controller/article.controller.js');

const { handleJWT, handleUselessParams } = require('../middleware/common.middleware.js');
const { checkManagePower } = require('../middleware/manage.middleware.js');

router.post('/add', handleJWT(), checkManagePower, handleUselessParams, add);
router.post('/update', handleJWT(), checkManagePower, update);
router.get('/remove', handleJWT(), checkManagePower, remove);
router.post('/findByPage', handleJWT(), checkManagePower, findByPage);
router.get('/findByList', handleJWT(), checkManagePower, findAllByList);

// 用户调用&管理员
router.get('/findById', handleJWT('parse'), findById);

// 用户调用
router.post('/findByCode', handleJWT('parse'), findByCode);

module.exports = router;

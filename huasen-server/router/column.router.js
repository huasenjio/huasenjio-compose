/*
 * @Autor: huasenjio
 * @Date: 2021-08-21 21:07:58
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-12 10:52:14
 * @Description: 栏目路由
 */

const express = require('express');
const router = express.Router();

const { add, findByPage, remove, update, findByCode, findByList, findBindedSite, unbindSite, bindSite, updateBindedSiteOrder } = require('../controller/column.controller.js');
const { handleJWT, handleUselessParams } = require('../middleware/common.middleware.js');
const { checkManagePower } = require('../middleware/power.middleware.js');

router.post('/add', handleJWT(), checkManagePower, handleUselessParams, add);
router.post('/remove', handleJWT(), checkManagePower, remove);
router.post('/update', handleJWT(), checkManagePower, update);
router.post('/list', handleJWT(), checkManagePower, findByList);
router.post('/findByCode', handleJWT(), checkManagePower, findByCode);
router.post('/findByPage', handleJWT(), checkManagePower, findByPage);
router.post('/findBindedSite', handleJWT(), checkManagePower, findBindedSite);

/**
 * @api {post} /column/unbindSite 取消绑定网站
 * @apiVersion 1.0.0
 * @apiGroup Column
 * @apiParam {string} columnId 栏目_id
 * @apiParam {string} siteIds 网站_id数组
 */
router.post('/unbindSite', handleJWT(), checkManagePower, unbindSite);

/**
 * @api {post} /column/bindSite 绑定网站
 * @apiVersion 1.0.0
 * @apiGroup Column
 * @apiParam {string} columnId 栏目_id
 * @apiParam {string} siteIds 网站_id数组
 */
router.post('/bindSite', handleJWT(), checkManagePower, bindSite);

/**
 * @api {post} /column/updateBindedSiteOrder 更新绑定网站顺序
 * @apiVersion 1.0.0
 * @apiGroup Column
 * @apiParam {string} columnId 栏目_id
 * @apiParam {string} siteIds 网站_id数组
 */
router.post('/updateBindedSiteOrder', handleJWT(), checkManagePower, updateBindedSiteOrder);

module.exports = router;

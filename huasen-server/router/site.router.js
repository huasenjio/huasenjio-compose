/*
 * @Autor: huasenjio
 * @Date: 2021-08-21 21:07:58
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-04-23 22:33:35
 * @Description: 网链路由
 */

const express = require('express');
const router = express.Router();
const { add, addMany, findByPage, remove, removeMany, update, findByCode, findByList, findSiteTagByList, findSiteColumnByList, bindColumn, unbindColumn, importSite, exportSite } = require('../controller/site.controller.js');
const { handleJWT, handleUselessParams } = require('../middleware/common.middleware.js');
const { checkManagePower } = require('../middleware/manage.middleware.js');

router.post('/add', handleJWT(), checkManagePower, handleUselessParams, add);
router.post('/addMany', handleJWT(), checkManagePower, handleUselessParams, addMany);
/**
 * @api {post} /site/findByPage 分页查询网站链接
 * @apiVersion 1.0.0
 * @apiGroup Site
 * @apiParam {number} pageNo 页码
 * @apiParam {number} pageSize 页长
 * @apiParam {string} name 网链名称
 * @apiParam {number} code 权限码
 * @apiParam {string} tag 标签名
 */
router.post('/findByPage', handleJWT(), checkManagePower, findByPage);
router.post('/remove', handleJWT(), checkManagePower, remove);
router.post('/removeMany', handleJWT(), checkManagePower, removeMany);
router.post('/update', handleJWT(), checkManagePower, update);
router.post('/list', handleJWT(), checkManagePower, findByList);
router.post('/siteTagList', handleJWT(), checkManagePower, findSiteTagByList);
router.post('/siteColumnList', handleJWT(), checkManagePower, findSiteColumnByList);
router.post('/bindColumn', handleJWT(), checkManagePower, bindColumn);
router.post('/unbindColumn', handleJWT(), checkManagePower, unbindColumn);

/**
 * @api {post} /site/importSite 通过xlsx文件导入网站链接
 * @apiVersion 1.0.0
 * @apiGroup Site
 * @apiParam {string[]} [columns] 绑定栏目_id的数组 -> ["_id1", "_id2"]
 * @apiParam {file} file 文件句柄
 */
router.post('/importSite', handleJWT(), checkManagePower, importSite);

/**
 * @api {get} /site/exportSite 导出网站链接
 * @apiVersion 1.0.0
 * @apiGroup Site
 * @apiParam {string[]} [columns] 绑定栏目_id的数组 -> ["_id1", "_id2"]
 */
router.post('/exportSite', handleJWT(), checkManagePower, exportSite);

/**
 * @api {post} /site/findByCode 通过code查询网站链接
 * @apiVersion 1.0.0
 * @apiGroup Site
 * @apiParam {number} code 权限码
 */
router.post('/findByCode', handleJWT('parse'), findByCode);

module.exports = router;

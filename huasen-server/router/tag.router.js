const express = require('express');
const router = express.Router();

const { findByList, findByPage, addTag, removeTag, removeManyTags, updateTag } = require('../controller/tag.controller.js');

/**
 * @api {get} /tag/findByList 获取标签列表
 * @apiVersion 1.0.0
 * @apiGroup Tag
 */
router.get('/findByList', findByList);

/**
 * @api {post} /tag/findByPage 分页查询标签
 * @apiVersion 1.0.0
 * @apiGroup Tag
 * @apiParam {Number} pageNo 页码
 * @apiParam {Number} pageSize 页长
 * @apiParam {String} name 标签名称
 */
router.post('/findByPage', findByPage);

/**
 * @api {post} /tag/addTag 添加标签
 * @apiVersion 1.0.0
 * @apiGroup Tag
 * @apiParam {String} name 标签名称
 */
router.post('/addTag', addTag);

/**
 * @api {post} /tag/removeTag 删除标签
 * @apiVersion 1.0.0
 * @apiGroup Tag
 * @apiParam {String} _id 标签id
 */
router.post('/removeTag', removeTag);

/**
 * @api {post} /tag/removeManyTags 批量删除标签
 * @apiVersion 1.0.0
 * @apiGroup Tag
 * @apiParam {Array} ids 标签id数组
 */
router.post('/removeManyTags', removeManyTags);

/**
 * @api {post} /tag/updateTag 更新标签
 * @apiVersion 1.0.0
 * @apiGroup Tag
 * @apiParam {String} _id 标签id
 * @apiParam {String} name 标签名称
 */
router.post('/updateTag', updateTag);

module.exports = router;

const express = require('express');
const router = express.Router();

const { findByList, findByPage, addPin, removePin, removeManyPins, updatePin } = require('../controller/pin.controller.js');

/**
 * @api {get} /pin/findByList 获取置顶标记列表
 * @apiVersion 1.0.0
 * @apiGroup Pin
 */
router.get('/findByList', findByList);

/**
 * @api {post} /pin/findByPage 分页查询置顶标记
 * @apiVersion 1.0.0
 * @apiGroup Pin
 * @apiParam {Number} pageNo 页码
 * @apiParam {Number} pageSize 页长
 * @apiParam {String} name 置顶标记名称
 */
router.post('/findByPage', findByPage);

/**
 * @api {post} /pin/addPin 添加置顶标记
 * @apiVersion 1.0.0
 * @apiGroup Pin
 * @apiParam {string} name 置顶标记名称
 * @apiParam {string} color 置顶标记颜色
 * @apiParam {string} bg 置顶标记背景颜色
 */
router.post('/addPin', addPin);

/**
 * @api {post} /pin/removePin 删除置顶标记
 * @apiVersion 1.0.0
 * @apiGroup Pin
 * @apiParam {String} _id 置顶标记id
 */
router.post('/removePin', removePin);

/**
 * @api {post} /pin/removeManyPins 批量删除置顶标记
 * @apiVersion 1.0.0
 * @apiGroup Pin
 * @apiParam {Array} ids 置顶标记id数组
 */
router.post('/removeManyPins', removeManyPins);

/**
 * @api {post} /pin/updatePin 更新置顶标记
 * @apiVersion 1.0.0
 * @apiGroup Pin
 * @apiParam {String} _id 置顶标记id
 * @apiParam {String} name 标记名称
 * @apiParam {String} color 标记颜色
 * @apiParam {String} bgColor 背景颜色
 */
router.post('/updatePin', updatePin);

module.exports = router;

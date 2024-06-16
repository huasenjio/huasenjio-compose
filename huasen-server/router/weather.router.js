/*
 * @Autor: huasenjio
 * @Date: 2022-10-22 15:30:53
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-22 15:31:03
 * @Description: 邮箱路由
 */

const express = require('express');
const router = express.Router();

const { getWeatherByCityCode } = require('../controller/weather.controller.js');

/**
 * @api {get} /weather/getWeatherByCityCode 通过城市码获取天气信息
 * @apiVersion 1.0.0
 * @apiGroup Weather
 * @apiParam {string} cityId 城市码
 */
router.get('/getWeatherByCityCode', getWeatherByCityCode);

module.exports = router;

/*
 * @Autor: huasenjio
 * @Date: 2022-08-14 16:55:59
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-08-27 16:25:38
 * @Description: 日志系统
 */
const log4js = require('log4js');
const log4jsConfig = require('../log4js.config.js');

// 传入配置对象
log4js.configure(log4jsConfig);

// 获得日志对象
// const loggerOfInfo = log4js.getLogger('info')
const loggerOfWarn = log4js.getLogger('warn');
const loggerOfError = log4js.getLogger('error');

// console.info = loggerOfInfo.info.bind(loggerOfInfo) // 项目中任何地方输入console.info输出的内容将会被日志捕获，并输出于log/run.xxx.log
console.warn = loggerOfWarn.warn.bind(loggerOfWarn); // 项目中任何地方输入console.error输出的内容将会被日志捕获，并输出于log/warn.log
console.error = loggerOfError.error.bind(loggerOfError); // 项目中任何地方输入console.error输出的内容将会被日志捕获，并输出于log/error.log

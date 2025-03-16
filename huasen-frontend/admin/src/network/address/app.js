/*
 * @Autor: huasenjio
 * @Date: 2022-10-10 01:15:26
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-05-24 22:57:36
 * @Description: 文件操作接口
 */

const Mock = require('mockjs2');
import { get, post } from '../request.js';

const getCopyright = get('/app/getCopyright');
const getDictionary = post('/app/getDictionary');
const findAppConfig = post('/app/findAppConfig');
const saveAppConfig = post('/app/saveAppConfig');
const runCode = post('/app/runCode');
const offline = post('/app/offline');
const getCity = get('/app/getCity');

export { getCopyright, getDictionary, findAppConfig, saveAppConfig, runCode, offline, getCity };

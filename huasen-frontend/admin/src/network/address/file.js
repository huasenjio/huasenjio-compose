/*
 * @Autor: huasenjio
 * @Date: 2022-10-10 01:15:26
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-05-24 22:57:36
 * @Description: 文件操作接口
 */

const Mock = require('mockjs2');
import { get, post } from '../request.js';

const findAllFile = get('/file/findAll');
const findAllIcon = get('/file/findAllIcon');
const removeFile = post('/file/remove');

export { findAllFile, findAllIcon, removeFile };

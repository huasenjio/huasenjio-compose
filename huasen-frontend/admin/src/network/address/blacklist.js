/*
 * @Autor: huasenjio
 * @Date: 2022-10-15 14:56:57
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-25 21:25:08
 * @Description: 黑名单
 */
const Mock = require('mockjs2');
import { get, post } from '../request.js';

const findBlacklistByPage = post('/blacklist/findByPage');
const removeBlacklist = post('/blacklist/remove');
const addBlacklist = post('/blacklist/add');

export { findBlacklistByPage, removeBlacklist, addBlacklist };

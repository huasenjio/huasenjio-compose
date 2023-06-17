/*
 * @Autor: huasenjio
 * @Date: 2022-10-10 01:15:26
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-04-25 00:21:12
 * @Description: 文件操作接口
 */

const Mock = require('mockjs2');
import { get, post } from '../request.js';

const findSiteByPage = post('/site/findByPage');
const addSite = post('/site/add');
const addManySite = post('/site/addMany');
const removeSite = post('/site/remove');
const removeManySite = post('/site/removeMany');
const updateSite = post('/site/update');
const findSiteByList = post('/site/list');

export { findSiteByPage, addSite, addManySite, removeSite, removeManySite, updateSite, findSiteByList };

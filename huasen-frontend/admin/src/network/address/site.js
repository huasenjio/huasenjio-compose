/*
 * @Autor: huasenjio
 * @Date: 2022-10-10 01:15:26
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-04-25 00:21:12
 * @Description: 链接操作接口
 */

const Mock = require('mockjs2');
import { get, post } from '../request.js';

const findSiteByPage = post('/site/findByPage');
const addSite = post('/site/add');
const removeSite = post('/site/remove');
const removeManySite = post('/site/removeMany');
const updateSite = post('/site/update');
const findSiteByList = post('/site/list');
const findSiteTagByList = post('/site/siteTagList');
const findSiteColmunByList = post('/site/siteColumnList');
const bindColumnToSite = post('/site/bindColumn');
const unbindColumnToSite = post('/site/unbindColumn');
const findSiteFavicon = post('/site/findSiteFavicon');
const findSiteDetail = post('/site/findSiteDetail');

export {
  findSiteByPage,
  addSite,
  removeSite,
  removeManySite,
  updateSite,
  findSiteByList,
  findSiteTagByList,
  findSiteColmunByList,
  bindColumnToSite,
  unbindColumnToSite,
  findSiteFavicon,
  findSiteDetail,
};

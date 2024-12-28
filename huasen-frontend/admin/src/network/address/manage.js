/*
 * @Autor: huasenjio
 * @Date: 2022-10-02 00:03:15
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-25 21:25:28
 * @Description: 管理员接口地址
 */

const Mock = require('mockjs2');
import { get, post, upload } from '../request.js';

const login = post('/manage/login');
const exist = post('/manage/exist');
const init = post('/manage/init');
const findManageByPage = post('/manage/findByPage');
const addManage = post('/manage/add');
const removeManage = post('/manage/remove');
const updateManage = post('/manage/update');
const uploadFile = upload('/manage/upload');
const quitManage = post('/manage/quit');
const offline = post('/manage/offline');

const overview = post('/manage/overview');
const diskOverview = post('/manage/diskOverview');
const uvOverview = post('/manage/uvOverview');
const visitor = post('/manage/visitor');

const findAppConfig = post('/manage/findAppConfig');
const saveAppConfig = post('/manage/saveAppConfig');
const executeRuntimeCode = post('/manage/executeRuntimeCode');
const findAppFavicon = post('/manage/findAppFavicon');

export { login, exist, init, findManageByPage, addManage, removeManage, updateManage, uploadFile, quitManage, overview, diskOverview, uvOverview, visitor, executeRuntimeCode, findAppConfig, saveAppConfig, findAppFavicon, offline };

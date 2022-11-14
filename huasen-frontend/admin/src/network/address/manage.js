/*
 * @Autor: huasenjio
 * @Date: 2022-10-02 00:03:15
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-18 00:27:05
 * @Description: 管理员接口地址
 */

import Mock from 'mockjs2';
import { get, post, upload } from '../request.js';

const login = post('/manage/login');
const findManageByPage = post('/manage/findByPage');
const addManage = post('/manage/add');
const removeManage = post('/manage/remove');
const updateManage = post('/manage/update');
const uploadFile = upload('/manage/upload');

const overview = post('/manage/overview');
const diskOverview = post('/manage/diskOverview');
const uvOverview = post('/manage/uvOverview');
const visitor = post('/manage/visitor');

export { login, findManageByPage, addManage, removeManage, updateManage, uploadFile, overview, diskOverview, uvOverview, visitor };

/*
 * @Autor: huasenjio
 * @Date: 2022-10-10 01:15:26
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-12 23:24:06
 * @Description: 文件操作接口
 */

import Mock from 'mockjs2';
import { get, post } from '../request.js';

const findTakeByPage = post('/take/findByPage');
const addTake = post('/take/add');
const removeTake = post('/take/remove');
const updateTake = post('/take/update');

export { findTakeByPage, addTake, removeTake, updateTake };

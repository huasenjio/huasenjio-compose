/*
 * @Autor: huasenjio
 * @Date: 2022-10-10 01:15:26
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-25 21:25:16
 * @Description: 文件操作接口
 */

const Mock = require('mockjs2');
import { get, post } from '../request.js';

const findColumnByPage = post('/column/findByPage');
const addColumn = post('/column/add');
const removeColumn = post('/column/remove');
const updateColumn = post('/column/update');
const findColumnByList = post('/column/list');

export { findColumnByPage, addColumn, removeColumn, updateColumn, findColumnByList };

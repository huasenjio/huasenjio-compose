/*
 * @Autor: huasenjio
 * @Date: 2022-10-10 01:15:26
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-25 21:25:23
 * @Description: 文件操作接口
 */

const Mock = require('mockjs2');
import { get, post } from '../request.js';

const findJournalByPage = post('/journal/findByPage');
const addJournal = post('/journal/add');
const removeJournal = post('/journal/remove');
const updateJournal = post('/journal/update');

export { findJournalByPage, addJournal, removeJournal, updateJournal };

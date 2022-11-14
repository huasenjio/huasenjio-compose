/*
 * @Autor: huasenjio
 * @Date: 2022-10-29 12:26:43
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-29 12:59:06
 * @Description: 日志接口地址
 */

import { get, post } from '../request.js';

const findRecordByPage = post('/record/findByPage');
const removeRecord = post('/record/remove');

export { findRecordByPage, removeRecord };

/*
 * @Autor: huasenjio
 * @Date: 2022-10-10 01:15:26
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-10 22:15:19
 * @Description: 文件操作接口
 */

import Mock from 'mockjs2';
import { get, post } from '../request.js';

const findAllFile = get('/file/findAll');
const removeFile = post('/file/remove');

export { findAllFile, removeFile };

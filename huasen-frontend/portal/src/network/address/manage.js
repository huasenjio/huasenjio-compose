/*
 * @Autor: huasenjio
 * @Date: 2022-10-26 23:40:52
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-19 16:15:35
 * @Description: 系统相关接口
 */

import Mock from 'mockjs2';
import { get, post } from '../request.js';

const findAppConfig = post('/manage/findAppConfig');

export default { findAppConfig };

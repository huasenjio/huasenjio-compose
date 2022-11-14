/*
 * @Autor: huasenjio
 * @Date: 2022-10-26 23:40:52
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-26 23:48:16
 * @Description: 系统相关接口
 */

import Mock from 'mockjs2';
import { get, post } from '../request.js';

const findAppConfig = post('/manage/appConfig');

export default { findAppConfig };

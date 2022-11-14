/*
 * @Autor: huasenjio
 * @Date: 2022-10-22 23:36:45
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-24 00:05:34
 * @Description: 订阅接口地址
 */

import Mock from 'mockjs2';
import { get, post } from '../request.js';

const findTakeByCode = post('/take/findByCode');

export default {
  findTakeByCode,
};

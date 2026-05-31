/*
 * @Autor: huasenjio
 * @Date: 2022-10-02 00:03:15
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-25 21:25:28
 * @Description: 
 */

const Mock = require('mockjs2');
import { get, post, upload } from '../request.js';

export const overview = post('/statistics/overview');
export const diskInfo = post('/statistics/disk');
export const uvInfo = post('/statistics/uv');
export const visitorInfo = post('/statistics/visitor');

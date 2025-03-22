/*
 * @Autor: huasenjio
 * @Date: 2022-10-10 01:15:26
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-05-24 22:57:36
 * @Description: APP
 */

const Mock = require('mockjs2');
import { get, post } from '../request.js';

const getCopyright = get('/app/getCopyright');
const getCity = get('/app/getCity');
const findAppConfig = post('/app/user/findAppConfig');

export default { getCopyright, findAppConfig, getCity };

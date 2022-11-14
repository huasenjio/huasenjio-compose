/*
 * @Autor: huasenjio
 * @Date: 2022-10-22 10:49:51
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-24 00:32:36
 * @Description: 文章接口地址
 */

import Mock from 'mockjs2';
import { get, post } from '../request.js';

const findArticleByCode = post('/article/findByCode');
const getArtcileById = get('/article/findById');

export default {
  findArticleByCode,
  getArtcileById,
};

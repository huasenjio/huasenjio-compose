/*
 * @Autor: huasenjio
 * @Date: 2022-10-05 21:17:08
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-07 00:07:39
 * @Description:
 */
import { get, post } from '../request.js';

const addArticle = post('/article/add');
const findArticleByPage = get('/article/findByPage');
const removeArticle = get('/article/remove');
const findArticleById = get('/article/findById');
const updateArticle = post('/article/update');

export { addArticle, findArticleByPage, removeArticle, findArticleById, updateArticle };

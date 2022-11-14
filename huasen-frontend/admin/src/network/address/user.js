/*
 * @Autor: huasenjio
 * @Date: 2022-10-07 17:58:58
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-07 18:06:34
 * @Description: 用户接口地址
 */
import Mock from 'mockjs2';
import { get, post } from '../request.js';

const findUserByPage = post('/user/findByPage');
const addUser = post('/user/add');
const removeUser = post('/user/remove');
const updateUser = post('/user/update');

export { findUserByPage, addUser, removeUser, updateUser };
